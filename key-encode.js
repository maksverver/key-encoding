let base16input = document.getElementById('base16input');
let base32input = document.getElementById('base32input');
let base16output = document.getElementById('base16output');
let base32output = document.getElementById('base32output');
let variantAlphabet = document.getElementById('variant-alphabet');
let variantChecked = document.getElementById('variant-checked');
let variantGrouped = document.getElementById('variant-grouped');

let BASE_16_DIGITS = "0123456789abcdef";

let BASE_32_DIGITS = {
    "uppercase": "23456789ABCDEFGHJKLMNPQRSTUVWXYZ",
    "lowercase": "abcdefghijkmnpqrstuvwxyz23456789",
}

let CRC5_TAB = [0, 5, 10, 15, 20, 17, 30, 27, 13, 8, 7, 2, 25, 28, 19, 22, 26, 31, 16, 21, 14, 11, 4, 1, 23, 18, 29, 24, 3, 6, 9, 12];

function calculateCrc5(base32num) {
    let crc = 0;
    for (let digit of base32num) {
        crc = CRC5_TAB[digit ^ crc];
    }
    return crc;
}

// Converts a base-N array to a string, where N == alphabet.length.
//
// The input must be an array of numbers, each between 0 and N (exclusive).
// The result is the number encoded as a string, using letters from the given
// alphabet.
//
// For example, baseEncode([3, 1, 4], 'ABCDE') === 'DBE';
function baseEncode(numArray, alphabet) {
    return numArray.map(alphabet.charAt.bind(alphabet)).join('');
}

// Converts a base-N string to an array, where N == alphabet.length.
//
// The input must be a string, with charcaters from `alphabet`. The result is
// the number encoded as an array, where each element is an integer between 0
// and N (exclusive). If the input contains any invalid characters, this
// function returns `null` instead.
//
// For example, baseDecode('DBE', ABCDE') === [3, 1, 4];
function baseDecode(numString, alphabet) {
    let numArray = [];
    for (let i = 0; i < numString.length; ++i) {
        let digit = alphabet.indexOf(numString.charAt(i));
        if (digit < 0) {
            return null;
        }
        numArray.push(digit);
    }
    return numArray;
}

// Recalculates the base-32 encoded output from the base-16 input.
function reencode() {
    let base32alphabet = BASE_32_DIGITS[variantAlphabet.value];
    let checked = variantChecked.value == 'true';
    let grouped = variantGrouped.value == 'true';

    function base16toBase32(base16num) {
        while (base16num.length % 5 != 0) {
            base16num.unshift(0);
        }
        let base32num = [];
        for (let i = 0; i < base16num.length; i += 5) {
            let word = (
                (base16num[i + 0] << 16) |
                (base16num[i + 1] << 12) |
                (base16num[i + 2] <<  8) |
                (base16num[i + 3] <<  4) |
                (base16num[i + 4] <<  0));
            base32num.push((word >> 15) & 31);
            base32num.push((word >> 10) & 31);
            base32num.push((word >>  5) & 31);
            base32num.push((word >>  0) & 31);
        }
        return base32num;
    }

    // Converts a base-16 string to a base-32 array.
    function decodeBase16(base16string) {
        let base16num = baseDecode(base16string.toLowerCase(), BASE_16_DIGITS);
        if (base16num == null) {
            return null;
        }
        return base16toBase32(base16num);
    }

    // Converts a base-32 array to a base-32 string.
    function encodeBase32(base32num) {
        if (grouped) {
            // This assumes base32num.length is a multiple of 4.
            let groups = [];
            for (let i = 0; i < base32num.length; i += 4) {
                let groupNum = base32num.slice(i, i + 4);
                if (checked) {
                    groupNum.push(calculateCrc5(groupNum));
                }
                groups.push(baseEncode(groupNum, base32alphabet));
            }
            return groups.join('-');
        } else {
            if (checked) {
                base32num.push(calculateCrc5(base32num));
            }
            let i = 0;
            while (i + 1 < base32num.length && base32num[i] == 0) {
                ++i;
            }
            return baseEncode(base32num.slice(i), base32alphabet);
        }
    }

    let base32num = decodeBase16(base16input.value);
    base32output.value = base32num && base32num.length > 0 ? encodeBase32(base32num) : '';
}

// Recalculates the base-16 encoded output from the base-32 input.
function redecode() {
    let alphabet = BASE_32_DIGITS[variantAlphabet.value];
    let checked = variantChecked.value == 'true';
    let grouped = variantGrouped.value == 'true';

    function decode(s) {
        function base32toBase16(base32num) {
            while (base32num.length % 4 != 0) {
                base32num.unshift(0);
            }
            let base16num = [];
            for (let i = 0; i < base32num.length; i += 4) {
                let word = (
                    (base32num[i + 0] << 15) |
                    (base32num[i + 1] << 10) |
                    (base32num[i + 2] <<  5) |
                    (base32num[i + 3] <<  0));
                base16num.push(
                    (word >> 16) & 15,
                    (word >> 12) & 15,
                    (word >>  8) & 15,
                    (word >>  4) & 15,
                    (word >>  0) & 15);
            }
            return base16num;
        }
        let result = '';
        // Decodes the 
        function process(s) {
            let base32num = baseDecode(s, alphabet);
            if (base32num == null || (grouped && base32num.length != 4 + checked)) {
                return false;
            }
            if (checked) {
                // Remove and verify check digit.
                let check = base32num.pop();
                if (calculateCrc5(base32num) !== check) {
                    return false;
                }
            }
            result += baseEncode(base32toBase16(base32num), BASE_16_DIGITS);
            return true;
        }
        if (grouped) {
            if (!s.split('-').every(process)) {
                return null;
            }
        } else {
            if (!process(s)) {
                return null;
            }
        }
        // Trim leading zeroes from result.
        let i = 0, zero = BASE_16_DIGITS.charAt(0);
        while (i < result.length - 1 && result.charAt(i) === zero) {
            ++i;
        }
        return result.substring(i);
    }

    let value = base32input.value == '' ? '' : decode(base32input.value);
    if (value !== null) {
        base32input.classList.add('valid');
        base32input.classList.remove('invalid');
        base16output.value = value;
    } else {
        base32input.classList.add('invalid');
        base32input.classList.remove('valid');
        base16output.value = '';
    }
}

function recalculate() {
    reencode();
    redecode();
}

base16input.addEventListener("input", reencode);
base32input.addEventListener("input", redecode);
variantAlphabet.addEventListener("change", recalculate);
variantChecked.addEventListener("change", recalculate);
variantGrouped.addEventListener("change", recalculate);

recalculate();
