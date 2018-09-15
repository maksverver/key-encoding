import sys

CRC5_TAB = (0, 5, 10, 15, 20, 17, 30, 27, 13, 8, 7, 2, 25, 28, 19, 22, 26, 31, 16, 21, 14, 11, 4, 1, 23, 18, 29, 24, 3, 6, 9, 12)

BASE32_DIGITS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

def EncodeWord(word):
	s = BASE32_DIGITS
	t = CRC5_TAB
	a = (word >> 15) & 31
	b = (word >> 10) & 31
	c = (word >>  5) & 31
	d = (word >>  0) & 31
	e = t[d ^ t[c ^ t[b ^ t[a]]]]
	return s[a] + s[b] + s[c] + s[d] + s[e]

def SplitIntoWords(n):
	bits = 20
	mask = (1 << bits) - 1
	words = [n & mask]
	n >>= bits
	while n > 0:
		words.append(n & mask)
		n >>= bits
	words.reverse()
	return words

def EncodeNumber(n):
	return '-'.join(map(EncodeWord, SplitIntoWords(n)))

print('Enter hexadecimal codes, one per line.')
for line in sys.stdin:
	if not line.strip():
		break
	print(EncodeNumber(int(line, 16)))
