# Reformulator
Transforms an object into another object, array, number, string or interactive DOM element. Templates are written entirely in JSON and DOM elements can respond to user interactions.

## Implementation

### Node
```js
import reform from 'reformulator';
reform('<p ["Hello " + value]>', { value: 'World' });
```

### Browser
```html
<script src="reformulator.min.js"></script>
<script>reform('"Hello " + value', { value: 'World' });</script>
```

## Examples

### Data

```js
reform({
	image: {
		src: 'domain + path',
		alt: 'altText'
	},
	description: 'description'
}, {
	domain: 'http://image.domain.com',
	path: '/lorem-ipsum.jpg',
	altText: 'lorem ipsum',
	description: 'Lorem ipsum dolor sit amet.'
});
```

The call above will produce the object below.

```json
{
	"image": {
		"src": "http://image.domain.com/lorem-ipsum.jpg",
		"alt": "lorem ipsum"
	},
	"description": "Lorem ipsum dolor sit amet."
}
```

### HTML

```js
reform([
	'<div [] "example">', [
		'<h2 [heading]>',
		'<img [image] src: src, alt: alt>',
		'<p [paragraphs]>'
	]
], {
	heading: 'Lorem Ipsum',
	image: {
		src: '/lorem-ipsum.jpg',
		alt: 'lorem ipsum'
	},
	paragraphs: [
		'lorem ipsum dolor sit amet.',
		'Consectetur adipiscing elit.'
	]
});
```

The call above will produce the HTML below.

```html
<div class="example">
	<img alt="lorem ipsum" src="/lorem-ipsum.jpg">
	<p>lorem ipsum dolor sit amet.</p>
	<p>Consectetur adipiscing elit.</p>
</div>
```

### HTML (with interaction)

```js
reform([
	'<p [items - (expanded & 0 | items."length" - 3)]>',
	'<a ["Show " + (expanded & "Less" | "More")] onclick: expanded>'
], {
	items: [
		'Lorem',
		'Ipsum',
		'Dolor',
		'Sit',
		'Amet'
	]
});
```

The call above will produce the HTML below.

```html
<div>
	<p>Lorem</p>
	<p>Ipsum</p>
	<p>Dolor</p>
	<a href="javascript:void(0);">Show More</a>
</div>
<script>reform(["<p [items - (expanded & 0 | items.'length' - 3)]>","<a ['Show ' + (expanded & 'Less' | 'More')] onclick: expanded>"],{"items":["Lorem","Ipsum","Dolor","Sit","Amet"]});</script>
```

The HTML will change to the following after clicking the "Show More" button.

```html
<div>
	<p>Lorem</p>
	<p>Ipsum</p>
	<p>Dolor</p>
	<p>Sit</p>
	<p>Amet</p>
	<a href="javascript:void(0);">Show Less</a>
</div>
```

The HTML will change back to its initial state after clicking the "Show Less" button.

### Advanced

```js
reform([
	'<ul>', [
		'<li [links]>', [
			'<a [url & image & @] href: url> | @', [
				{
					src: 'image',
					alt: 'altText'
				},
				'<img [src] "image", src: src, alt: alt>'
			],
			'<p [(description | url) & @]>', [
				'description',
				'description & url & " "',
				'<a [url & "click here"] href: url>'
			]
		]
	]
], {
	links: [
		{
			url: '/lorem-ipsum',
			image: '/lorem-ipsum.jpg',
			altText: 'lorem ipsum',
			description: 'Lorem ipsum.'
		},
		{
			url: '/dolor-sit',
			image: '/dolor-sit.jpg',
			altText: 'dolor sit',
			description: 'Dolor sit.'
		},
		{
			image: '/amet-consectetur.jpg',
			altText: 'amet consectetur',
			description: 'Amet consectetur.'
		},
		{
			image: '/adipiscing-elit.jpg',
			altText: 'adipiscing elit'
		},
		{
			url: '/lorem'
		}
	]
});
```


The call above will produce the HTML below.

```html
<ul>
	<li>
		<a href="/lorem-ipsum">
			<img class="image" alt="lorem ipsum" src="/lorem-ipsum.jpg">
		</a>
		<p>Lorem ipsum. <a href="/lorem-ipsum">click here</a></p>
	</li>
	<li>
		<a href="/dolor-sit">
			<img class="image" alt="dolor sit" src="/dolor-sit.jpg">
		</a>
		<p>Dolor sit. <a href="/dolor-sit">click here</a></p>
	</li>
	<li>
		<img class="image" alt="amet consectetur" src="/amet-consectetur.jpg">
		<p>Amet consectetur.</p>
	</li>
	<li>
		<img class="image" alt="adipiscing elit" src="/adipiscing-elit.jpg">
	</li>
	<li>
		<p>
			<a href="/lorem">click here</a>
		</p>
	</li>
</ul>
```

# Expression
Each expression is a sequence of operations that resolves to a single value. The operators are defined below along with their precedence in the order of operations. Operations with a higher precedence will be performed first, otherwise operations are performed left to right. Parentheses can be used to control the order of operations.

## Values
Arrays, objects, strings, numbers and boolean values can be referenced through variables in the expression string and read from the data you provide or be defined directly in the expression string. Expressions in objects, arrays and elements can only contain variables, strints, number or boolean values.

### Variables
Any text not surrounded by quotes will be treated as a variable name to read from the input data. Each template array can add another scope to the stack of data. If it fails to find a value in the immediate scope in the stack, it will continue until it does or there are no more scope objects to read from.

#### @
This can be used to reference the immediate scope. It is useful when the scope is a string or a number or if you don't want to use scopes higher up in the stack.

#### ?
When placed immediately before a variable, the value will be a boolean 'false' if the variable is empty, otherwise it will be a boolean 'true'. A value will be considered empty if it is undefined, null, NaN, an empty string, an object with no properties or an array with no items.

#### !
When placed immediately before a variable, the value will be a boolean 'true' if the variable is not empty, otherwise it will be a boolean 'false'. A value will be considered empty if it is undefined, null, NaN, an empty string, an object with no properties or an array with no items.

### Strings
Strings can be defined by surrounding text in either single or double quotes. If the type of quote that was used to surround the string needs to also exists in the content of the string, it should be preceded by two backslashes.

### Numbers
Integers and decimals can be defined.

### Boolean
Boolean values can be defined.

### Objects
Objects can be defined by surrounding a sequence of keyed expressions in curly braces. The key for each expression should not be surrounded by quotes.

### Arrays
Arrays can be defined by surrounding a sequence of expressions in square brackets.

### Elements
Elements are surrounded by angle brackets and must start with a the tag name. This can be followed optionally by an expression in square brackets to set the scope and then keyed or non-keyed expressions to set the attributes and classes respectively. The scope will be used as the content of the element if its type allows content to be set and it is not followed by a content array. The output of an element will be an HTML string.

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
