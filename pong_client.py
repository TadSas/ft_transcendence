import os
import ssl
import six
import json
import array
import base64
import socket
import struct
import random
import argparse
import platform
import threading
import webbrowser

from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

try:
    from keyboard import read_key, press
except ImportError as ex:
    print(
        "Your computer does not have the keyboard library installed,"
        "install it using the following command:"
        "sudo pip install keyboard"
    )
    exit(1)


SCALE = 2
OPCODE_TEXT = 0x1

frame_thread = None
frame_thread_alive = True
state_thread = None
state_thread_alive = True

# ------------------------------------------------------------------------------

def read_from_dat_file(key):
    file_path = Path('.dat')

    if not file_path.exists():
        return None

    with open(file_path, 'r') as file:
        try:
            data = json.load(file)
        except Exception:
            return None

    return data.get(key)


def write_to_dat_file(key, value):
    data = {}
    file_path = Path('.dat')

    if file_path.exists():
        with open(file_path, 'r') as file:
            try:
                data = json.load(file)
            except Exception:
                pass

    data[key] = value

    with open(file_path, 'w') as file:
        json.dump(data, file)

# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------

def clear_terminal():
    if platform.system() == "Windows":
        os.system("cls")
    else:
        os.system("clear")


def ws_handshake(host: str, endpoint: str, jwt: str, port: int = 443) -> socket:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    context = ssl._create_unverified_context()
    conn = context.wrap_socket(sock, server_hostname=host)

    conn.connect((host, port))

    conn.send(
        (
            f"GET {endpoint} HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {base64.b64encode(os.urandom(16)).decode('utf-8')}\r\n"
            f"Sec-WebSocket-Version: 13\r\n"
            f"Cookie: ft_transcendence_jwt={jwt}\r\n\r\n"
        ).encode('utf-8')
    )

    if " 101 " not in conn.recv(4096).decode():
        return None

    return conn


def ws_mask(_m, _d):
    for i in range(len(_d)):
        _d[i] ^= _m[i % 4]

    if six.PY3:
        return _d.tobytes()
    else:
        return _d.tostring()


def ws_get_masked(data):
    mask_key = os.urandom(4)

    if data is None:
        data = ""

    bin_mask_key = mask_key

    if isinstance(mask_key, six.text_type):
        bin_mask_key = six.b(mask_key)

    if isinstance(data, six.text_type):
        data = six.b(data)

    _m = array.array("B", bin_mask_key)
    _d = array.array("B", data)
    s = ws_mask(_m, _d)

    if isinstance(mask_key, six.text_type):
        mask_key = mask_key.encode('utf-8')

    return mask_key + s


def ws_encode(data="", opcode=OPCODE_TEXT, mask=1):
    if opcode == OPCODE_TEXT and isinstance(data, six.text_type):
        data = data.encode('utf-8')

    length = len(data)
    fin, rsv1, rsv2, rsv3, opcode = 1, 0, 0, 0, opcode

    frame_header = chr(fin << 7 | rsv1 << 6 | rsv2 << 5 | rsv3 << 4 | opcode)

    if length < 0x7e:
        frame_header += chr(mask << 7 | length)
        frame_header = six.b(frame_header)
    elif length < 1 << 16:
        frame_header += chr(mask << 7 | 0x7e)
        frame_header = six.b(frame_header)
        frame_header += struct.pack("!H", length)
    else:
        frame_header += chr(mask << 7 | 0x7f)
        frame_header = six.b(frame_header)
        frame_header += struct.pack("!Q", length)

    if not mask:
        return frame_header + data

    return frame_header + ws_get_masked(data)


def ws_decode(data: str):
    _data = [character for character in data]
    length = _data[1] & 127
    index = 2

    if length < 126:
        index = 2
    if length == 126:
        index = 4
    elif length == 127:
        index = 10

    return array.array('B', _data[index:]).tobytes().decode()


def ws_send_message(socket: socket, message: dict):
    socket.sendall(ws_encode(data=json.dumps(message), opcode=OPCODE_TEXT))


def ws_close_connection(socket: socket):
    socket.close()

# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------

def auth(domain):
    write_to_dat_file('domain', domain)

    try:
        webbrowser.open(f"{domain}/login?terminal=true")
    except Exception:
        print("Unable to open the browser for authentication.")
        exit(1)

    while True:
        code = input("Enter the code from web browser (or 'exit' to quit): \n")

        if code.lower() == "exit":
            print("Authentication was interrupted, please try again!")
            exit(1)

        if not code:
            print("The authentication code was not collected!")
            continue

        if code:
            break

    try:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        request = Request(
            url=f"{domain}/auth/api/jwt/verify",
            data=json.dumps({'jwt': code}).encode()
        )
        request.add_header('Content-Type', 'application/json')

        with urlopen(request, context=ssl_ctx) as response:
            data = json.loads(response.read().decode())

        if not data['authenticated']:
            raise Exception()

        user = data['user']
    except Exception:
        print("Provided authentication code is not valid!")
        exit(1)

    write_to_dat_file('user', user)
    write_to_dat_file('token', code)

    print(f"You are successfully authenticated, {user['login']}!")


def list_users():
    if (
        not (token := read_from_dat_file('token')) or
        not (domain := read_from_dat_file('domain')) or
        not (user := read_from_dat_file('user'))
    ):
        print("You are not authenticated, please use the corresponding option!")
        exit(1)

    try:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        request = Request(url=f"{domain}/auth/api/users/all")
        request.add_header('Cookie', f'ft_transcendence_jwt={token}')

        with urlopen(request, context=ssl_ctx) as response:
            users = json.loads(response.read().decode())['data']['users']
    except Exception:
        print("An error occurred while fetching users!")
        exit(1)

    if not users:
        print("There is no user available at the moment!")
        exit(0)

    write_to_dat_file('users', users)

    users = "\n" + "\n".join(users)
    print(f"[{user['login']}] Available users: {users}")


def list_games(username):
    if (
        not (token := read_from_dat_file('token')) or
        not (domain := read_from_dat_file('domain')) or
        not (user := read_from_dat_file('user'))
    ):
        print("You are not authenticated, please use the corresponding option!")
        exit(1)

    if not (users := read_from_dat_file('users')):
        print("Before creating the game check the users list!")
        exit(1)

    if username == user['login']:
        print("You can't list the games without listing the user other than you!")
        exit(1)

    if username not in users:
        print("Provided user not from available users list!")
        exit(1)

    try:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        request = Request(url=f"{domain}/game/api/match/{username}/all")
        request.add_header('Cookie', f'ft_transcendence_jwt={token}')

        with urlopen(request, context=ssl_ctx) as response:
            matches = json.loads(response.read().decode())['data']['matches']
    except Exception:
        print("An error occurred while listing games!")
        exit(1)

    if not matches:
        print("No games found for this user")
        exit(1)

    matches = {match['id']: match for match in matches}
    write_to_dat_file('matches', matches)

    matches_meta = "\n"
    for match_id in matches:
        matches_meta += f"{match_id} - {matches[match_id]['created_at']}\n"

    print(f"[{user['login']}] Created matches with [{username}]: {matches_meta[:-1]}")


def create_game(username):
    if (
        not (token := read_from_dat_file('token')) or
        not (domain := read_from_dat_file('domain')) or
        not (user := read_from_dat_file('user'))
    ):
        print("You are not authenticated, please use the corresponding option!")
        exit(1)

    if not (users := read_from_dat_file('users')):
        print("Before creating the game check the users list!")
        exit(1)

    if username not in users:
        print("Provided user not from available users list!")
        exit(1)

    if username == user['login']:
        print("You can't create a game with you, choose another available user!")
        exit(1)

    try:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        request = Request(
            url=f"{domain}/game/api/match/create",
            data=urlencode({'username': username}).encode()
        )
        request.add_header('Cookie', f'ft_transcendence_jwt={token}')

        with urlopen(request, context=ssl_ctx) as response:
            match_id = json.loads(response.read().decode())['data']['match_id']
    except Exception:
        print("An error occurred while creating the pong match!")
        exit(1)

    print(
        f"[{user['login']}] The pong game against {username} was successfully created!\n"
        f"Here is the match id for this game, it will be used while starting the game: {match_id}"
    )


def render_frame(conn):
    endings = [
        "Fantastic game! Both of you were amazing!", "Great effort from both sides! Well played!", "What a match! You both rocked it!",
        "Superb playing! That was intense!", "Awesome game! Both players were on fire!", "Incredible match! You both showed great skill!"
    ]

    global frame_thread_alive
    global state_thread_alive

    frame_thread_alive and print("We are waiting for all parties to be ready to start the game.")

    while True:
        try:
            if not frame_thread_alive:
                exit()

            if not (raw_data := conn.recv(4096)):
                    continue

            response = json.loads(ws_decode(raw_data))

            match response['type']:
                case 'pong_start' | 'pong_reconnect':
                    clear_terminal()
                    print(response['map'])
                case 'pong_packet':
                    clear_terminal()
                    print(response['map'])
                case 'pong_pause':
                    print("It seems your opponent has left the game or switched to another tab. Please restart the game (press q).")

                    frame_thread_alive = False
                    state_thread_alive = False
                    exit()
                case 'pong_end':
                    print(random.choice(endings))

                    frame_thread_alive = False
                    state_thread_alive = False
        except KeyboardInterrupt:
            print("\nBye!")
            break
        except Exception:
            continue


def send_state(conn):
    global frame_thread_alive
    global state_thread_alive

    while True:
        try:
            if not state_thread_alive:
                exit()

            if (key := read_key()) == 'w':
                ws_send_message(conn, {'type': 'move_paddle', 'direction': 1})
                ws_send_message(conn, {'type': 'move_paddle', 'direction': 1})
            elif key == 's':
                ws_send_message(conn, {'type': 'move_paddle', 'direction': -1})
                ws_send_message(conn, {'type': 'move_paddle', 'direction': -1})
            elif key == 'q':
                print("\nBye")
                exit(0)
            else:
                ws_send_message(conn, {'type': 'move_paddle', 'direction': 0})

        except KeyboardInterrupt:
            print("\nBye!")
            break
        except ImportError:
            print("This command option requires superuser, please run as a superuser!")

            frame_thread_alive = False
            state_thread_alive = False
            exit()
        except Exception:
            continue


def start_game(match_id):
    if (
        not (token := read_from_dat_file('token')) or
        not (domain := read_from_dat_file('domain')) or
        not (read_from_dat_file('user'))
    ):
        print("You are not authenticated, please use the corresponding option!")
        exit(1)

    try:
        if not (conn := ws_handshake(
            domain.replace('http://', '').replace('https://', ''),
            f'/game/pong/room/{match_id}',
            token
        )):
            raise Exception()
    except Exception:
        print("Can't connect two game server, please try later!")
        exit(1)

    global frame_thread
    global state_thread

    state_thread = threading.Thread(target=send_state, args=(conn,))
    state_thread.start()
    frame_thread = threading.Thread(target=render_frame, args=(conn,))
    frame_thread.start()

# ------------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Game Management Script")
    parser.add_argument("--auth", nargs=1, metavar=('domain',), help="Authenticate user")
    parser.add_argument("--list-users", action="store_true", help="List all users")
    parser.add_argument("--list-games", nargs=1, metavar=('username',), help="List all games")
    parser.add_argument("--create-game", nargs=1, metavar=('username',), help="Create a new game")
    parser.add_argument("--start-game", nargs=1, metavar=('match_id',), help="Start a game")

    args = parser.parse_args()

    try:
        if args.auth:
            auth(*args.auth)
        elif args.list_users:
            list_users()
        elif args.list_games:
            list_games(*args.list_games)
        elif args.create_game:
            create_game(*args.create_game)
        elif args.start_game:
            start_game(*args.start_game)
        else:
            parser.print_help()
    except KeyboardInterrupt:
        frame_thread and frame_thread.join()
        state_thread and state_thread.join()
        print("\nBye!")
        exit(1)

if __name__ == "__main__":
    main()
