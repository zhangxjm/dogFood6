#!/usr/bin/env python
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "无法导入Django。请确认是否已安装Django，"
            "并且虚拟环境已激活。"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
