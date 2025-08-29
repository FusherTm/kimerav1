import os
import sys

import psycopg2


def main() -> int:
    url = os.getenv("DATABASE_URL")
    if not url:
        print("NO_DATABASE_URL")
        return 1
    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        cur.execute(
            """
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name = 'alembic_version'
            )
            """
        )
        exists = cur.fetchone()[0]
        cur.close()
        conn.close()
    except Exception as e:
        print(f"ERR:{e}")
        return 2

    if exists:
        print("HAS_VERSION")
        return 0
    else:
        print("NO_VERSION")
        return 10  # sentinel: needs stamping


if __name__ == "__main__":
    sys.exit(main())

