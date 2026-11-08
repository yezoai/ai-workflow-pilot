import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('runs on the exact Node patch pinned in .node-version', () => {
  const pinned = read('.node-version').trim();
  assert.match(pinned, /^\d+\.\d+\.\d+$/);
  assert.equal(process.version, `v${pinned}`);
  assert.equal(JSON.parse(read('package.json')).engines.node, pinned);
  assert.match(read('docs/testing.md'), new RegExp(pinned.replaceAll('.', '\\.')));
});

test('npm test is the only test command and there are no third-party dependencies', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.private, true);
  assert.deepEqual(Object.keys(pkg.scripts), ['test']);
  assert.equal(pkg.scripts.test, 'node --test');
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(pkg.optionalDependencies, undefined);
  assert.equal(pkg.packageManager, undefined);
});

test('package-lock.json records only the root package', () => {
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(lock.lockfileVersion, 3);
  assert.equal(lock.name, 'ai-workflow-pilot');
  assert.deepEqual(Object.keys(lock.packages), ['']);
  assert.equal(lock.packages[''].name, 'ai-workflow-pilot');
  assert.equal(lock.dependencies, undefined);
});

test('bootstrap documents and the human README are present', () => {
  const required = [
    'README.md',
    'AGENTS.md',
    'HANDOFF.md',
    'docs/requirements/pilot-001.md',
    'docs/testing.md',
    'docs/pr-policy.md',
    '.github/workflows/pr-checks.yml',
    '.github/pull_request_template.md',
    '.node-version',
  ];
  for (const relativePath of required) {
    assert.equal(existsSync(path.join(root, relativePath)), true, relativePath);
  }
  assert.equal(read('README.md'), '# ai-workflow-pilot\n');

  const agents = read('AGENTS.md');
  const agentLineCount = agents.endsWith('\n')
    ? agents.split('\n').length - 1
    : agents.split('\n').length;
  assert.ok(
    agentLineCount >= 80 && agentLineCount <= 120,
    `AGENTS.md should stay about 100 lines, got ${agentLineCount}`,
  );
  assert.match(agents, /npm test/);
  assert.match(agents, /pr-required/);

  const handoff = read('HANDOFF.md');
  for (const heading of ['## 目标', '## 责任执行者', '## 实际状态', '## 最近一次验证', '## 阻塞', '## 下一棒']) {
    assert.match(handoff, new RegExp(heading));
  }
  assert.match(read('docs/requirements/pilot-001.md'), /未实现/);
  assert.match(read('docs/testing.md'), /不验证未来的介绍页/);
  assert.match(read('docs/pr-policy.md'), /未应用/);
});

test('workflow is least privilege and pins action commits', () => {
  const workflowDir = path.join(root, '.github/workflows');
  assert.deepEqual(readdirSync(workflowDir), ['pr-checks.yml']);
  const workflow = read('.github/workflows/pr-checks.yml');
  const executable = workflow
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');

  assert.match(workflow, /pull_request:\n {4}branches:\n {6}- main/);
  assert.match(workflow, /push:\n {4}branches:\n {6}- main/);
  assert.match(workflow, /permissions:\n {2}contents: read\n/);
  assert.match(workflow, /node-version-file: \.node-version/);
  assert.match(workflow, /check-latest: false/);
  assert.match(workflow, /package-manager-cache: false/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm test/);
  assert.doesNotMatch(executable, /pull_request_target/);
  assert.doesNotMatch(executable, /secrets\./);
  assert.doesNotMatch(executable, /contents:\s*write/);
  assert.doesNotMatch(executable, /lts\/\*/);
  assert.doesNotMatch(executable, /node-version:\s*['"]?\d+\.x/);

  const uses = [...workflow.matchAll(/^\s*uses:\s*(\S+)\s+#\s*v\d+\.\d+\.\d+\s*$/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(uses, [
    'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1',
    'actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1',
  ]);
});

test('pr-required fails closed unless every constituent result is success', () => {
  const workflow = read('.github/workflows/pr-checks.yml');
  assert.match(workflow, / {2}pr-required:\n {4}name: pr-required\n {4}needs: test\n {4}if: \$\{\{ always\(\) \}\}/);
  assert.match(workflow, /needs\.test\.result/);
  assert.match(workflow, /!= "success"/);
  assert.match(workflow, /failure, cancelled, and skipped are not success/);
});

test('scaffold tests do not verify a future introduction page', () => {
  for (const relativePath of ['index.html', 'styles.css', 'main.js', 'test/page.test.mjs']) {
    assert.equal(
      existsSync(path.join(root, relativePath)),
      false,
      `${relativePath} is reserved for the later pilot-001 PR`,
    );
  }
  assert.doesNotMatch(read('package.json'), /playwright|puppeteer|jsdom|vitest|jest|mocha/i);
  assert.match(read('docs/testing.md'), /不打开浏览器/);
});
