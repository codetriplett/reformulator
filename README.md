# Reformulator
Transforms an object using a structured set of expressions. The transformation allows rescoping variables, iterating over arrays and rendering HTML, all without the need for writing your own logic in JavaScript. Results of transformations can be objects, arrays, numbers or strings. Since no JavaScript needs to be written, the transformation object can be stored in JSON. This package will add no additional dependencies to your project.

## Template
An array can be passed as the first parameter to relate container objects with content arrays. Each item that is not itself an array will be treated as a container object and the array that immediately follows, if it exists, will be its content. The container will provide a new scope for itself and its content. If a container does not have a content array, its scope will be its content. If a content array does not have a container, its scope will be the same as the one that would have been used to create the container. If the container is an HTML element, the content will be surrounded by opening and closing tags. If the scope of the container is empty, it will not be returned and its content will be ignored. If the scope of the container is an array it and its content will be processed together for each item in the array. If there is only one possible container in the template and its scope is not an array, it will be returned as the result of the template. Otherwise the result will be an array.

## Values
Arrays, objects, strings, numbers and boolean values can be referenced through variables in the expression string and read from the data you provide or be defined directly in the expression string. Expressions in objects, arrays and elements can only contain variables, strints, number or boolean values.

### Variables
Any text not surrounded by quotes will be treated as a variable name to read from the input data. Each template array can add another scope to the stack of data. If it fails to find a value in the immediate scope in the stack, it will continue until it does or there are no more scope objects to read from.

#### @
This can be used to reference the immediate scope. It is useful when the scope is a string or a number or if you don't want to use scopes higher up in the stack.

### Strings
Strings can be defined by surrounding text in either single or double quotes. If the type of quote that was used to surround the string needs to also exists in the content of the string, it should be preceded by two backslashes.

### Numbers
Numbers can be defined including decimals.

### Boolean
Boolean values can be defined.

### Objects
Objects can be defined by surrounding a sequence of keyed expressions in curly braces. The key for each expression should not be surrounded by quotes.

### Arrays
Arrays can be defined by surrounding a sequence of expressions in square brackets.

### Elements
Elements are surrounded by angle brackets and must start with a the tag name. This can be followed optionally by an expression in square brackets to set the scope and then keyed or non-keyed expressions to set the attributes and classes respectively. The scope will be used as the content of the element if its type allows content to be set and it is not followed by a content array. The output of an element will be an HTML string.

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

### ^ (Precedence: 6)
#### (number) ^ (number)
This will raise the number to its left by the power of the number to its right.

### . (Precedence: 7)
#### (object -or- array -or- string) . (string -or- number)
This will use the value to its right as a key to fetch a new value from the object, array or string to its left.
