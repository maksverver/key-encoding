#include <stdio.h>
#include <stdbool.h>
#include <assert.h>

static const char D[34] = "23456789ABCDEFGHJKLMNPQRSTUVWXYZI";

static const unsigned char CRC5_TAB[32] = {
         0,  5, 10, 15, 20, 17, 30, 27, 13,  8,  7,  2, 25, 28, 19, 22,
        26, 31, 16, 21, 14, 11,  4,  1, 23, 18, 29, 24,  3,  6,  9, 12 };

static int init;
static long long single_errors;
static long long single_total;
static long long swap_errors;
static long long swap_total;
static long long substitution_errors;
static long long substitution_total;

static int checkDigit(int a, int b, int c, int d) {
    return CRC5_TAB[d ^ CRC5_TAB[c ^ CRC5_TAB[b ^ CRC5_TAB[a ^ init]]]];
}

static bool isValid(int a, int b, int c, int d, int e) {
    return e == checkDigit(a, b, c, d);
}

static bool checkError(int a, int b, int c, int d, int e, int f, int g, int h, int i, int j) {
    if (isValid(f, g, h, i, j)) {
        fprintf(stderr, "%c%c%c%c%c -> %c%c%c%c%c\n", D[a], D[b], D[c], D[d], D[e], D[f], D[g], D[h], D[i], D[j]);
        return true;
    }
    return false;
}

static void checkSingleError(int a, int b, int c, int d, int e) {
    for (int x = 0; x < 32; ++x) {
        if (x != a) ++single_total, single_errors += checkError(a, b, c, d, e, x, b, c, d, e);
        if (x != b) ++single_total, single_errors += checkError(a, b, c, d, e, a, x, c, d, e);
        if (x != c) ++single_total, single_errors += checkError(a, b, c, d, e, a, b, x, d, e);
        if (x != d) ++single_total, single_errors += checkError(a, b, c, d, e, a, b, c, x, e);
        if (x != e) ++single_total, single_errors += checkError(a, b, c, d, e, a, b, c, d, x);
    }
}

static void checkSwapError(int a, int b, int c, int d, int e) {
    if (a != b) ++swap_total, swap_errors += checkError(a, b, c, d, e, b, a, c, d, e);
    if (b != c) ++swap_total, swap_errors += checkError(a, b, c, d, e, a, c, b, d, e);
    if (c != d) ++swap_total, swap_errors += checkError(a, b, c, d, e, a, b, d, c, e);
    if (d != e) ++swap_total, swap_errors += checkError(a, b, c, d, e, a, b, c, e, d);
}

static void checkSubstitutionError(int a, int b, int c, int d, int e) {
    for (int x = 0; x < 32; ++x) {
        if (x == a || x == b || x == c || x == d || x == e) {
            for (int y = 0; y < 32; ++y) {
                if (y != a && y != b && y != c && y != d && y != e) {
                    ++substitution_total;
                    substitution_errors += checkError(a, b, c, d, e,
                        a == x ? y : a,
                        b == x ? y : b,
                        c == x ? y : c,
                        d == x ? y : d,
                        e == x ? y : e);
                }
            }
        }
    }
}

static void checkErrors(int a, int b, int c, int d, int e) {
    checkSingleError(a, b, c, d, e);
    checkSwapError(a, b, c, d, e);
    checkSubstitutionError(a, b, c, d, e);
}

int main() {
    for (init = 0; init < 32; ++init) {
        for (int a = 0; a < 32; ++a) {
            for (int b = 0; b < 32; ++b) {
                for (int c = 0; c < 32; ++c) {
                    for (int d = 0; d < 32; ++d) {
                        checkErrors(a, b, c, d, checkDigit(a, b, c, d));
                    }
                }
            }
        }
    }
    printf("single_errors=%lld (%.3lf%%)\n", single_errors, 100.0*single_errors / single_total);
    printf("swap_errors=%lld (%.3lf%%)\n", swap_errors, 100.0*swap_errors / swap_total);
    printf("substitution_errors=%lld (%.3lf%%)\n", substitution_errors, 100.0*substitution_errors / substitution_total);
    printf("total errors=%lld\n", single_errors + swap_errors + substitution_errors);
}
