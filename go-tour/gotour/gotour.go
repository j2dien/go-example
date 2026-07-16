package gotour

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)


func Sandbox() {
	fmt.Println("Selamat datang di playground!")

	fmt.Println("Waktu sekarang adalah", time.Now())
}

func Packages() {
	fmt.Println("Bilangan kesukaan saya adalah", rand.Intn(10))
}

func Imports() {
	fmt.Printf("Sekarang anda memiliki %g masalah.\n", math.Sqrt(7))
}

func ExportedNames() {
	fmt.Println(math.Pi)
}

func add(x int, y int) int {
	return x + y
}

func Functions() {
	fmt.Println(add(42, 13))
}

func add2(x, y int) int {
	return x + y
}

func FunctionsContinued() {
	fmt.Println(add2(42, 13))
}

func swap(x, y string) (string, string) {
	return y, x
}

func FunctionsMultipleResults() {
	a, b := swap("hello", "world")
	fmt.Println(a, b)
}

func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func FunctionsNamedResults() {
	fmt.Println(split(9))
}

var c, python, java bool

func Variables()  {
	var i int
	fmt.Println(i, c, python, java)
}

var i, j int = 1, 2

func VariablesWithInitializers() {
	var c, python, java = true, false, "no!"
	fmt.Println(i, j, c, python, java)
}