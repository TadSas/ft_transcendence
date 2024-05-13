import os
import six
import json
import array
import socket
import base64
import struct

from typing import Any


OPCODE_TEXT = 0x1

def get_by_path(dictionary: dict, path: str, delimiter: str = "/") -> Any:
    """

    Parameters
    ----------
    dictionary : dict
    path : str
    delimiter : str, optional

    Returns
    -------
    Any

    """
    for item in path.split(delimiter):
        dictionary = dictionary[item]

    return dictionary


def set_by_path(dictionary: dict, path: str, item: Any, delimiter: str = "/") -> None:
    """

    Parameters
    ----------
    dictionary : dict
    path : str
    item : Any
    delimiter : str, optional

    """
    path = path.split(delimiter)

    dictionary = get_by_path(dictionary, delimiter.join(path[:-1]))

    dictionary[path[-1]] = item

def ws_handshake(host: str, endpoint: str, port: int) -> socket:
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((host, port))

    client_socket.send(
        (
            f"GET {endpoint} HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {base64.b64encode(os.urandom(16)).decode('utf-8')}\r\n"
            "Sec-WebSocket-Version: 13\r\n"
            "\r\n"
        ).encode()
    )

    if " 101 " not in client_socket.recv(4096).decode():
        return None

    return client_socket


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
    _data = [ord(character) for character in data]
    length = _data[1] & 127
    index = 2

    if length < 126:
        index = 2
    if length == 126:
        index = 4
    elif length == 127:
        index = 10

    return array.array('B', _data[index:]).tostring()


def ws_send_message(socket: socket, message: dict):
    socket.sendall(ws_encode(data=json.dumps(message), opcode=OPCODE_TEXT))


def ws_close_connection(socket: socket):
    socket.close()
