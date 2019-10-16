import re
import sys
from pathlib import Path


class Migrate:
    preserve_detectors = [
        r'([\s]+)?\*\s@deprecated$',
    ]
    remove_detectors = [
        r'([\s]+)?\*\s@[\S]+$',
        r'([\s]+)?\*\s@[\w]+\s[\S]+$',
    ]
    function_detectors = [
        r'.*function\s?\(.*'
    ]
    untyped_detectors = [
        r'(.*(?:const|let)\s?)([\w]+)(\s?=.*)'
    ]

    def __init__(self, path: Path):
        self.path = path

    def read(self) -> str:
        with self.path.open() as source_file:
            contents = source_file.read()
        return contents

    def write(self, contents: str) -> int:
        return self.path.write_text(contents)

    def preserve(self, content: str) -> list:
        return [re.fullmatch(detector, content) for detector in self.preserve_detectors]

    def remove(self, content: str) -> list:
        return [re.fullmatch(detector, content) for detector in self.remove_detectors]

    def skip(self, content: str) -> bool:
        return any(self.remove(content)) and not any(self.preserve(content))

    def convert(self, content: str) -> str:
        # upgrade to arrow functions
        if any([re.fullmatch(detector, content) for detector in self.function_detectors]):
            g = re.fullmatch(r'(.*)function\s?\(((?:[\w\s:,]+)?)?\)\s?{(.*)', content).groups()
            d = ', '
            return g[0] + '(' + d.join([x + ': any' for x in g[1].split(d)]) + ') => {' + g[2]
        # add types to var declarations
        untyped_var = re.fullmatch(r'(.*(?:const|let)\s?[\w]+)(\s?=.*)', content)
        if untyped_var:
            g = untyped_var.groups()
            return g[0] + ': any' + g[1]
        # add types to function declarations
        untyped_function = re.fullmatch(
            r'((?:[\s]+)?(?!if|else|switch)(?:[\w]+)(?:[\s]+)?\()((?:[\w\s:,]+)?)(\)(?:[\s]+)?{(?:[\s]+)?)',
            content)
        if untyped_function:
            g = untyped_function.groups()
            d = ', '
            return g[0] + d.join([x if ':' in x or not len(x) else x + ': any' for x in g[1].split(d)]) + g[2]
        return content

    def shift(self, contents: str) -> str:
        lines = []
        d = '\n'
        return d.join([self.convert(x) for x in contents.split(d) if not self.skip(x)])


def test():
    # tests
    tests = {
        '* @foo': True,
        ' * @foo': True,
        '* @foo {bar}': True,
        ' * @foo {bar}': True,
        '* @foo {bar} baz': False,
        ' * @foo {bar} baz': False,
    }

    migrate = Migrate(Path('.'))
    print(migrate.convert('    listen(options) {'))
    for instance, value in tests.items():
        results = migrate.remove(instance)
        if any(results) != value:
            print('failed:', results)


def main():
    import argparse

    # settings
    parser = argparse.ArgumentParser(description='TypeScript Migrations')
    parser.add_argument('-v', '--version', dest='version', action='version', version='1.0')
    parser.add_argument('targets', metavar='t', type=str, nargs='+', help='target(s) to migrate')

    # parse
    args = parser.parse_args()

    for target in args.targets:
        path = Path(target)
        if not path.is_file():
            raise ValueError(f'Path: {target} does not exist!')
        migrate_test = Migrate(path)
        print('file:', target)
        # changing = True
        # while changing:
        data = migrate_test.read()
        print('size:', sys.getsizeof(data), 'bytes')
        converted = migrate_test.shift(data)
        if data == converted:
            print('status: nothing changed!')
            continue
        migrate_test.write(converted)
        print('wrote:', sys.getsizeof(converted), 'bytes')
        # changing = False


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nGoodbye!')
