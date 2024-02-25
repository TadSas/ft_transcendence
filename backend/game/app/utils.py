from typing import Any


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