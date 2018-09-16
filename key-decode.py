import sys

CRC5_TAB = (0, 5, 10, 15, 20, 17, 30, 27, 13, 8, 7, 2, 25, 28, 19, 22, 26, 31, 16, 21, 14, 11, 4, 1, 23, 18, 29, 24, 3, 6, 9, 12)

BASE16_DIGITS = '0123456789abcdef'
BASE32_DIGITS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

def CalculateCrc5(digits):
	crc5 = 0
	for digit in digits:
		crc5 = CRC5_TAB[digit ^ crc5]
	return crc5

def DecodeGroup(group):
	if len(group) != 5:
		print('Invalid group "{}": must be 5 characters long.'.format(group))
		return None
	digits = []
	for c in group:
		try:
			digits.append(BASE32_DIGITS.index(c.upper()))
		except ValueError:
			print('Invalid character "{}" in group "{}".'.format(c, group))
			return None
	check = digits.pop()
	if CalculateCrc5(digits) != check:
		print('Invalid group "{}": CRC failed.'.format(group))
		return None
	result = 0
	for digit in digits:
		result = (result << 5) | digit
	return result

print('Enter base-32 codes, one per line.')
for line in sys.stdin:
	line = line.strip()
	if not line:
		break
	result = ''
	for group in line.split('-'):
		word = DecodeGroup(group)
		if word is None:
			result += '?????'
		else:
			result += '%05x' % word
	print(result)
