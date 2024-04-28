import os
import jwt
import uuid
import psycopg
import argparse
import datetime


def create_user(user_data: dict):
    db = None

    try:
        db = psycopg.connect(
            "dbname='{}' user='{}' host='{}' password='{}'".format(
                os.environ['POSTGRES_AUTH_NAME'],
                os.environ['POSTGRES_AUTH_USER'],
                os.environ['POSTGRES_HOST'],
                os.environ['POSTGRES_PASSWORD'],
            )
        )

        write_cursor = db.cursor()

        user_data.update({
            'status': 'offline',
            'avatar_path': 'avatars/default/default_avatar.jpg',
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now(),
            'two_factor_enabled': False
        })

        write_cursor.execute(
            """
                INSERT INTO app_users(
                    id, login, email, first_name, last_name, status,
                    avatar_path, created_at, updated_at, two_factor_enabled
                )
                VALUES (
                    %(id)s, %(login)s, %(email)s, %(first_name)s,
                    %(last_name)s, %(status)s, %(avatar_path)s, %(created_at)s,
                    %(updated_at)s, %(two_factor_enabled)s
                );
            """,
            user_data
        )

        db.commit()

        write_cursor.close()

        print(f"\nUser {user_data.get('login')} was created:")
        print(f"id:  {user_data.get('id')}")
        print(f"jwt: {user_data.get('jwt')}")

    except Exception:
        db and db.rollback()
    finally:
        db and db.close()


def main():
    parser = argparse.ArgumentParser(description='User creation script')
    parser.add_argument('--login', help='User login', required=True)
    parser.add_argument('--email', help='User email', required=True)
    parser.add_argument('--first-name', help='User first name', required=True)
    parser.add_argument('--last-name', help='User last name', required=True)
    args = parser.parse_args()

    user_id = str(uuid.uuid4())

    create_user({
        'id': user_id,
        'login': args.login,
        'email': args.email,
        'first_name': args.first_name,
        'last_name': args.last_name,
        'jwt': jwt.encode(
            {
                'id': user_id,
                'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=365),
                'iat': datetime.datetime.now(datetime.UTC)
            },
            os.environ['AUTH_PROJECT_SECRET'],
            algorithm='HS256'
        )
    })

if __name__ == "__main__":
    main()
