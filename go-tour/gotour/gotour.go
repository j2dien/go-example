package gotour

import (
	"fmt"
	"math"
	"math/cmplx"
	"math/rand"
	"time"
)

// Sandbox demonstrates the use of packages.
func Sandbox() {
	fmt.Println("Selamat datang di playground!")

	fmt.Println("Waktu sekarang adalah", time.Now())
}

// Packages demonstrates the use of packages.
func Packages() {
	fmt.Println("Bilangan kesukaan saya adalah", rand.Intn(10))
}

// Imports demonstrates the use of imports.
func Imports() {
	fmt.Printf("Sekarang anda memiliki %g masalah.\n", math.Sqrt(7))
}

// ExportedNames demonstrates the use of exported names.
func ExportedNames() {
	fmt.Println(math.Pi)
}

// Functions demonstrates the use of functions.
func add(x int, y int) int {
	return x + y
}

func Functions() {
	fmt.Println(add(42, 13))
}

// FunctionsContinued demonstrates the use of functions with multiple results.
func add2(x, y int) int {
	return x + y
}

func FunctionsContinued() {
	fmt.Println(add2(42, 13))
}

// FunctionsMultipleResults demonstrates the use of functions with multiple results.
func swap(x, y string) (string, string) {
	return y, x
}

func FunctionsMultipleResults() {
	a, b := swap("hello", "world")
	fmt.Println(a, b)
}

// FunctionsNamedResults demonstrates the use of functions with named results.
func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func FunctionsNamedResults() {
	fmt.Println(split(9))
}

// Variables demonstrates the use of variables.
var c, python, java bool

func Variables()  {
	var i int
	fmt.Println(i, c, python, java)
}

// VariablesWithInitializers demonstrates the use of variables with initializers.
var i, j int = 1, 2

func VariablesWithInitializers() {
	var c, python, java = true, false, "no!"
	fmt.Println(i, j, c, python, java)
}


// BasicTypes demonstrates the use of basic types.
var (
	Tobe bool = false
	MaxInt uint64 = 1<<64 - 1
	z complex128 = cmplx.Sqrt(-5 + 12i)
)

func BasicTypes() {
	fmt.Printf("Type: %T Value: %v\n", Tobe, Tobe)
	fmt.Printf("Type: %T Value: %v\n", MaxInt, MaxInt)
	fmt.Printf("Type: %T Value: %v\n", z, z)
}

// ZeroValues demonstrates the use of zero values.
func ZeroValues() {
	var i int
	var f float64
	var b bool
	var s string
	fmt.Printf("%v %v %v %q\n", i, f, b, s)

}

// TypeConversions demonstrates the use of type conversions.
func TypeConversions() {
	var x, y int = 3,4
	var f float64 = math.Sqrt(float64(x * x + y * y))
	var z uint = uint(f)
	fmt.Println(x, y, z)
}

// TypeInference demonstrates the use of type inference.
func TypeInference() {
	v := 0.867 + 0.5i // ubahlah nilai v!
	fmt.Printf("v bertipe %T\n", v)
}


// Constants demonstrates the use of constants.
const Pi = 3.14

func Constants() {
	const World = "世界"
	fmt.Println("Hello", World)
	fmt.Println("Happy", Pi, "Day")

	const Truth = true
	fmt.Println("Go rules?", Truth)
}

// NumericConstants demonstrates the use of numeric constants.
const (
	// Buat bilangan yang besar dengan men-shift 1 bit ke kiri 100 kali.
	// Dengan kata lain, bilangan binari 1 diikuti dengan 100 angka nol.
	Big = 1 << 100
	// Shift kembali ke kanan sebanyak 99 kali, sehingga akhirnya menjadi
	// 1<<1, atau 2
	Small = Big >> 99
)

func needInt(x int) int {return x*10 + 1}
func needFloat(x float64) float64 {return x * 0.1}

func NumericConstants() {
	fmt.Println(needInt(Small))
	fmt.Println(needFloat(Small))
	fmt.Println(needFloat(Big))
}

// For demonstrates the use of for loops.
func For() {
	sum := 0
	for i := 0; i < 10; i++ {
		sum += i
	}
	fmt.Println(sum)
}

// ForContinued demonstrates the use of for loops with different forms.

//Perintah for adalah "while"-nya Go
func ForContinued() {
	sum := 1
	for sum < 1000 {
		sum += sum
	}
	fmt.Println(sum)
}


// If demonstrates the use of if statements.
func sqrt(x float64) string {
	if x  < 0 {
		return sqrt(-x) + "i"
	}
	return fmt.Sprint(math.Sqrt(x))
}

func If() {
	fmt.Println(sqrt((2)), sqrt(-4))
}


// IfWithaShortStatement demonstrates the use of if statements with a short statement.
func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	}
	return lim
}

func IfWithAShortStatement() {
	fmt.Println(
		pow(3, 2, 10),
		pow(3, 3, 20),
	)
}

// IfandElse demonstrates the use of if-else statements.
func pow2(x, n, lim float64) float64 {
  if v:= math.Pow(x, n); v < lim {
	return v
  } else {
	fmt.Printf("%g >= %g\n", v, lim)
  }
  // v tidak dapat digunakan disini
  return lim
}

func IfandElse() {
	fmt.Println(
		pow2(3, 2, 10),
		pow2(3, 3, 20),
	)
}