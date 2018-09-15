# Calculates 5-bit look-up tables for a CRC with polynomial x^5 + x^2 + 1.

def Crc5Bitwise(n):
	'Calculates CRC-5 of a 20 bit number, one bit at a time.'
	n <<= 5
	for i in reversed(range(20)):
		if n & (1 << (i + 5)):
			n ^= 0b100101 << i
	return n

def Crc5Wordwise(n):
	'Calculates CRC-5 of a 20 bit number, five bits at a time.'
	crc = 0
	for i in reversed(range(0, 20, 5)):
		crc = crc5_table[((n >> i) & 31) ^ crc]
	return crc

crc5_table = [Crc5Bitwise(i) for i in range(32)]
print('crc5_table = {}'.format(crc5_table))

# Sanity check. Verify both implementations produce the same results. 
for i in range(1 << 20):
	assert Crc5Bitwise(i) == Crc5Wordwise(i)
