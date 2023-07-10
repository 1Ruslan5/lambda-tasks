interface Array<T> {
    all(predicate: (element: T) => boolean): boolean,
    any(predicate?: (element: T) => boolean): boolean,
    associateBy<TKey, TValue>(keySelecetor: (element: T) => TKey, valueTransform?: (element: T) => TValue): Map<TKey, TValue>,
    average(): Number,
    chunked(size: number, transform?: (element: T) => T): Array<Set<T>>,
    distinctBy(selector?: (element: T) => T): Array<T>,
    customFilter(predicate: (element: T) => boolean): Array<T>,
    filterIndexed(predicate: (index: number, element: T) => boolean): Array<T>,
    filterNot(predicate: (element: T) => boolean): Array<T>,
    customeFind(predicate: (element: T) => boolean): T | undefined,
    findLast(predicate: (element: T) => boolean): T | undefined,
    flatten(): Array<T>,
    fold(initial: T, operation: (acc: T, element: T) => T): T,
    maxBy(selector: (element: T) => T): T,
    minBy(selector: (element: T) => T): T,
    count(predicate: (element: T) => number): number,
    groupBy<K, V>(keySelector: (key: T) => K, valueTransform?: (element: T) => V): Map<K, Array<V>>;
}

Array.prototype.all = function (predicate) {
    for (let i of this) {   // loop all of this
        if (!predicate(i)) { // check every value using user's predicate and will perform after false
            return false    // if value does not fulfill predicate than it will return false
        }
    }
    return true // if all values meet to predicate than it will return true
}

Array.prototype.any = function (predicate = () => true) {
    for (let i = 0; i <= this.length; i++) { // loop by all length of this
        if (predicate(this[i])) { // check every value using user's predicate
            return true // if value fulfill predicate than it will return true
        }
    }
    return false // if all values meet to predicate than it will return false
}

Array.prototype.associateBy = function (keySelecetor, valueTransform = (element) => element) {
    const answerMap = new Map(); // create dictionary to be filled in cycle
    for (let i of this) { // loop all of this
        answerMap.set(keySelecetor(i), valueTransform(i)); // filling map with data from key selector and valueTransform
    }
    return answerMap
}

Array.prototype.average = function () {
    let sum = 0; // create counter to be sumed all data from array
    for (let i of this) { // loop all of this
        sum += i; //summing data from array
    }
    return sum / this.length // divide all sum for 
}

Array.prototype.chunked = function (size, transform) {
    let array = [] // create array for containing of sets
    let k = Math.ceil(this.length / size); // calculate quantity of loops
    let end; // declarate variable which will contain end of sets
    for (let i = 0; i < k; i++) { // loop which repeat how many set shoud exist
        end = (size * (i + 1) > this.length) ? this.length : size * (i + 1); // calculate the end of the set using array loop and make condition for check if array have uneven size
        const set = new Set(); // create set
        for (let j = size * i; j < end; j++) { // loop for fill set
            set.add(this[j]); // add element to set
        }
        if (transform) { // condition for check user introduce the transform or no
            const newSet = new Set(); // create new set for input change data
            for (let value of set) {
                newSet.add(transform(value)); // add new data after use transform
            }
            array.push(newSet); // add changed set to array
        } else {
            array.push(set); // add set if tansform doesn't exist
        }
    }
    return array;
}

Array.prototype.distinctBy = function (selector) {
    const set = new Set(this); // create new set using array, that delete all repeats in array
    let array = []; // create array which contain all data from set
    if (selector) { // check selector exist or no
        for (let i of set) {
            array.push(selector(i)); // add changed data(use selector) to array 
        }
    } else {
        array = Array.from(set) // add all data to array without use selector
    }
    return array
}

Array.prototype.customFilter = function (predicate) {
    const array = []; // create array which contain all data after filter
    for (let i = 0; i < this.length; i++) { // loop by all length of this
        if (predicate(this[i])) { // check element using predicate
            array.push(this[i]); // if true add to new array
        }
    }
    return array;
}

Array.prototype.filterIndexed = function (predicate) {
    const array = []; // create array which contain all data after filter
    for (let i = 0; i < this.length; i++) { // loop by all length of this
        if (predicate(i, this[i])) { // check id and element using predicate
            array.push(this[i]); // if true add to new array
        }
    }
    return array
}

Array.prototype.filterNot = function (predicate) {
    const array = []; // create array which contain all data after filter
    for (let i = 0; i < this.length; i++) { // loop by all length of this
        if (!predicate(this[i])) { // check element using predicate and will perform after false 
            array.push(this[i]); // if false add to new array
        }
    }
    return array
}

Array.prototype.customeFind = function (predicate) {
    for (let i = 0; i < this.length; i++) { // loop by all length of this
        if (predicate(this[i])) { // if value performs condition return true
            return this[i] // return value which performed codition
        }
    }
}

Array.prototype.findLast = function (predicate) {
    for (let i = this.length; i > 0; i--) { // loop by all length of array. it start from the end
        if (predicate(this[i])) { // if value performs condition return true
            return this[i] // return value which performed codition
        }
    }
}

Array.prototype.flatten = function () {
    const array = []; // create array 
    for (let arr of this) { // loop all of this
        for (let i = 0; i < arr.length; i++) { // loop all of arr which exist in this
            array.push(arr[i]); // add data to array
        }
    }
    return array
}

Array.prototype.fold = function (initial, operation) {
    let result = initial; // variable declaration for starter which contain all data from array
    for (let data of this) { // loop of this
        result = operation(result, data) // add data using user operation
    }
    return result
}

Array.prototype.maxBy = function (selector) {
    if (this.length === 0) { // this are checking is empty or no
        return undefined // back result if this is empty 
    }

    let value = selector(this[0]); // first value have took and used the user`s selector, it's need for return result and checking in the loop
    for (let i = 1; i < this.length; i++) { // loop of this but skip their first value
        if (selector(this[i]) > value) { // check data from this with first element or largest
            value = selector(this[i]); // if current data bigger than value  It will take element from this
        }
    }
    return value
}

Array.prototype.minBy = function (selector) {
    if (this.length === 0) { // this are checking is empty or no
        return undefined // back result if this is empty
    }

    let value = selector(this[0]); // first value have took and used the user`s selector, it's need for return result and checking in the loop
    for (let i = 1; i < this.length; i++) { // loop of this but skip their first value
        if (selector(this[i]) < value) { // check data from this with first element or smallest
            value = selector(this[i]); // if current data lower than value It will take element from this
        }
    }
    return value
}

Array.prototype.count = function (selector) {
    let count = 0; // variable declaration for sum all data from array
    for (let i = 0; i < this.length; i++) { // loop of array length
        count += selector(this[i]); // sum data to one varible and use selector for this variables
    }
    return count
}

Array.prototype.groupBy = function (keySelector, valueTransform = (element) => element) {
    const groups = new Map(); // map declaration

    for (const value of this) { // loop of this variables
        const key = keySelector(value); // choose a key for input it in map
        const group = groups.get(key); // take array from map by key 
        const element = valueTransform(value); // apply user's valueTransform

        if (group) { //check for exist array
            group.push(element); // if array exist add element to it
        } else {
            groups.set(key, [element]); // if array doesn't exist it will create it
        }
    }

    return groups;
}

const a = [2]
console.log("All: " + a.all((element: number) => element % 2 === 0));
console.log("Any: " + a.any())

const value = [1, 2, 3, 4, 5, 6]
console.log("Average: " + value.average());

const array: Array<number> = []
console.log("Chunked: " + array.chunked(3, (num: number) => num * 2));

const hop = [1, 2, 2, 4, 4, 6, 7];

console.log("DistinctBy: " + hop.distinctBy((num) => num * 2));
console.log("CustomFilter: " + hop.customFilter((num) => num % 2 === 0));
console.log("FilterIndexed: " + hop.filterIndexed((indexed, i) => indexed === i));
console.log("FilterNot: " + hop.filterNot((num) => num % 2 === 0));
console.log("CustomeFind: " + hop.customeFind((num) => num % 2 === 0));
console.log("FindLast: " + hop.findLast((num) => num % 2 === 0));

const container = [[1, 2, 3], [5, 6, 7, 8], [10]]
console.log("Flatten: " + container.flatten());

const arr = ['Hello', ' ', 'world', '!']
console.log("Fold: " + arr.fold('', (acc, num) => acc + num));

const persons = [1, 2, 5, 4, 3];
console.log("MaxBy: " + persons.maxBy(number => number));
console.log("MinBy: " + persons.minBy(number => number));

const people = [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }, { name: "Charlie", age: 30 }, { name: "Dave", age: 25 }];
const groupBy = people.groupBy((person) => person.age, (person) => person.name);
console.log("GroupBy:");
for (const [key, values] of groupBy) {
    console.log(key, values);
}

const b = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'Mike' }];
const associateBy = b.associateBy((element) => element.id, (element) => element.name);
console.log("AssociateBy:");
for (const [key, value] of associateBy) {
    console.log(key, value);
}