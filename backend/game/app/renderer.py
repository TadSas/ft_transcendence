import math
import copy


class PongRenderer:
	SCALE = 2

	def __init__(self, data):
		borders = data['borders']

		self.width = ((abs(borders['left']) + abs(borders['right'])) * self.SCALE) * 2 + 1
		self.height = ((abs(borders['top']) + abs(borders['bottom'])) * self.SCALE) + 1

		self._map = self.init_map()
		self.working_map = {}


	def init_map(self):
		_map = []

		for row in range(self.height):
			_map.append([])

			for _ in range(self.width):
				_map[row].append(' ')

		return _map


	def render_frame(self, paddles, paddle_measurements, ball, ball_measurements, score):
		self.working_map = copy.deepcopy(self._map)

		try:
			for paddle in (*paddles['left'].values(), *paddles['right'].values()):
				self.draw_object(
					math.ceil(paddle['x']),
					math.ceil(paddle['y']),
					paddle_measurements['width'],
					paddle_measurements['height']
				)

			self.draw_object(
				math.ceil(ball['x']),
				math.ceil(ball['y']),
				ball_measurements['diameter'],
				ball_measurements['diameter']
			)
		except Exception:
			return ''

		return self.init_frame(score)


	def draw_object(self, object_x, object_y, object_width, object_height):
		x_coordinate = math.ceil(self.height // 2 - object_y * self.SCALE) + 1
		y_coordinate = ((self.width // 2 - 1) // 2 + (object_x * self.SCALE)) * 2 + 2

		object_width = math.ceil(object_width) * self.SCALE
		object_height = math.ceil(object_height) * self.SCALE // 2

		if (
			x_coordinate + object_height - x_coordinate + object_height and
			y_coordinate + object_width + 1 - y_coordinate + object_width > 1
		):
			for x_point in range(x_coordinate - object_height, x_coordinate + object_height + 1):
				for y_point in range(y_coordinate - object_width, y_coordinate + object_width + 1):
					if x_point == x_coordinate - object_height and y_point == y_coordinate - object_width:
						self.working_map[x_point][y_point] = '+' # top left

					elif x_point == x_coordinate - object_height and y_point == y_coordinate + object_width:
						self.working_map[x_point][y_point] = '+' # top right

					elif x_point == x_coordinate - object_height:
						self.working_map[x_point][y_point] = 'X'

					elif (y_point == y_coordinate - object_width or y_point == y_coordinate + object_width) and x_coordinate - object_height < x_point < x_coordinate + object_height:
						self.working_map[x_point][y_point] = 'X'

					elif x_point == x_coordinate + object_height and y_point == y_coordinate - object_width:
						self.working_map[x_point][y_point] = '+' # bottom left

					elif x_point == x_coordinate + object_height and y_point == y_coordinate + object_width:
						self.working_map[x_point][y_point] = '+' # bottom right

					elif x_point == x_coordinate + object_height:
						self.working_map[x_point][y_point] = 'X'

					else:
						self.working_map[x_point][y_point] = 'X'
		else:
			for x_point in range(x_coordinate - object_height, x_coordinate + object_height + 1):
				for y_point in range(y_coordinate - object_width, y_coordinate + object_width + 1):
					self.working_map[x_point][y_point] = 'X'


	def init_frame(self, score):
		left_number = str(score['left'])
		right_number = str(score['right'])

		output = '-' + '-' * ((self.width) // 2 - 4 - len(left_number))
		output += f"  {left_number}  -  {right_number}  "
		output += '-' + '-' * (self.width // 2 - 4 - len(right_number)) + '\n'

		output += 'X' * (self.width + 2) + '\n'

		for row in range(self.height):
			output += ' '

			for col in range(self.width):
				output += self.working_map[row][col]

			output += '\n'

		output += 'X' * (self.width + 2)

		return output
