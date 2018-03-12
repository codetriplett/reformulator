# reformulator
Transforms an object using a set of expressions that exist in a separate transformation object. The transformation allows rescoping variables and iterating over arrays, all without the need for functions. The expressions also extend the functionality of what is normally allowed in JavaScript.

## Structure
The structure of your transformation object will define the structure of the resulting object. Undefined and null values will be removed along with empty objects and arrays. You are free to nest objects and use whatever properties you like except for _ and $, which are reserved for the following purposes.

### _
Use this to add a new object or value to the stack. This will be used first when trying to resolve variables in the expression strings before moving to the next item in the stack. If this is set to an array, its sibling properties will be processed for each item in the array and the result will be an array of objects instead of a single object.

### $
This will be processed immediately after _. If it produces a valid object or value, this will be used instead of the object created from its sibling properties. This is useful for creating an array of strings or numbers. If the result of this is undefined or null, the sibling properties will be processed.

## Expression
Each expression is a sequence of operations that resolves to a single value. The operators are defined below. The precedence next to each determines the order of operations. The operator with the higher precedence will use its adjacent value in its operation first. Operators with the same precedence will be processed left to right. Operations inside of parentheses will be completed before using that value in operations outside of the parentheses.

### | (Precedence: 0)
This will keep the value to its left if it is defined and not false, otherwise this will keep the value to its right.

### & (Precedence: 1)
This will keep the value to its right if the one to its left is defined and not false, otherwise this will return null.

### = (Precedence: 2)
This will keep the value to its left if the following condition passes.
#### (string -or- number -or- boolean) = (string -or- number -or- boolean)
This will perform a simple equivalency check.
#### (object -or- array) = (object -or- array)
This will fully compare the properties of the two objects to determine if they are equal.

### ! (Precedence: 2)
This will keep the value to its left if the following condition passes.
#### (string -or- number -or- boolean) ! (string -or- number -or- boolean)
This will perform a simple non-equivalency check.
#### (object -or- array) ! (object -or- array)
This will fully compare the properties of the two objects to determine if they are not equal.

### < (Precedence: 2)
This will keep the value to its left if the following condition passes.
#### (string -or- number -or- boolean) < (string -or- number -or- boolean)
This will perform a simple 'less than' check.
#### (object -or- array) < (object -or- array)
This will fully compare the properties of the two objects to determine if the value to its right contains at least all the same properties as the one to its left and those values are the same between the two.

### > (Precedence: 2)
This will keep the value to its left if the following condition passes.
#### (string -or- number -or- boolean) > (string -or- number -or- boolean)
This will perform a simple 'greater than' check.
#### (object -or- array) > (object -or- array)
This will fully compare the properties of the two objects to determine if the value to its left contains at least all the same properties as the one to its right and those values are the same between the two.

### # (Precedence: 3)
#### (number) # (number)
This will convert the number to its left to a string with a number of decimals defined by the number to its right.

### + (Precedence: 4)
#### (number) + (number)
This will perform a simple addition.
#### (string) + (string)
This will add the string to its right to the end of the string to its left.
#### (object) + (object)
This will add the properties of the object to its right to the object to its left.
#### (array) + (object -or- string -or- number -or- boolean)
This will add the value to its right to the end of the array to its left.
#### (object -or- string -or- number -or- boolean) + (array)
This will add the value to its left to the beginning of the array to its right.
#### (array) + (array)
This will add the items of the array to its right to the end of the array to its left.

### - (Precedence: 4)
#### (number) - (number)
This will perform a simple subtraction.
#### (string) - (string)
This will create a regex of the string to its right and remove all instances from the string to its left.
#### (object) - (string)
This will remove a property from the object to its left.
#### (number) - (array -or- string)
This will remove a number of items from the beginning of the array or string.
#### (array -or- string) - (number)
This will remove a number of items from the end of the array or string.

### / (Precedence: 5)
#### (number) / (number)
This will perform a simple division.
#### (string) / (string -or- number)
This will split the string to its left using a regex created by the value to its right.

### * (Precedence: 5)
#### (number) * (number)
This will perform a simple multiplication.
#### (string) * (number) -or- (number) * (string)
This will repeat the string a number of times.
#### (string) * (array) -or- (array) * (string)
This will join the values in the array together placing the string between each one.

### % (Precedence: 5)
#### (number) % (number)
This will return the remainder from dividing the value to its left by the value to its right.

### . (Precedence: 6)
#### (object -or- array -or- string) . (string -or- number)
This will use the value to its right as a key to fetch a new value from the object, array or string to its left.
