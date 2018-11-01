![](https://i.imgur.com/RTlTF2g.png)

![Travis CI Badge](https://travis-ci.org/jbccollins/lapidary.svg?branch=master) 

:construction: Not ready for prime time yet! :construction:

### Configurable facet based filtering.

Heavily inspired by [Destiny Item Manager](https://github.com/DestinyItemManager/DIM)'s inventory search feature.

![](https://i.imgur.com/az5M2kM.png)

The idea is to basically just build a generic version of that.

[Here is a work in progress demo](https://jbccollins.github.io/lapidary/demo/index.html)

This screenshot kinda shows some of the more advanced types of queries you can do with Lapidary.
Right now I don't have documentation on what exactly is possible since so much is still in flux with the code.
![](https://i.imgur.com/qb46YMG.png)

At this point it's almost fully functional. I'd like to build a useful little input component around it to make it more approachable though.


### Anatomy of a Lapidary query
Every Lapidary query consists of filters that are combined in several ways. In keeping with the gem metaphor we'll refer to these filters as 'cuts'.
Each cut must match the regex `/.+:.*:.+/i`

Simply put they have to look like this:\
<img src="readme_images/basic.png" alt="basic" height="91px">

Each cut consists of three parts
1. facetKey - The property (facet) that this cut will operate on
2. operation - An indicator for the comparator function that is to be used
3. parameters - Give the comparator function something to compare against

Cuts can be linked through joins: \
<img src="readme_images/explicit_and.png" alt="basic" height="91px">

There are two join types: `AND` and `OR`
Spaces between cuts are implicitly treated as an `AND` join type.
This means that `age:>:21 AND age:<:30` is equivalent to `age:>:21 age:<:30`. It is still possible to have spaces in your parameters by using quotes like so: `street:=:"Brookside Avenue"`

Cuts can be encapsulated inside parentheses:\
<img src="readme_images/basic_parens.png" alt="basic" height="91px">

Cuts can be negated using the `NOT` keyword:\
<img src="readme_images/leading_not.png" alt="basic" height="91px">

Note that negation only affects cuts and encapsulations to the right and will affect EVERY cut and encapsulation to the right unless parentheses are used to restrict the domain of the negation.
For example

`age:>:21 AND NOT age:<:30 OR age:=:10`\
is equivalent to `age:>:21 AND NOT (age:<:30 OR age:=:10)`\
and can return different results than\
`age:>:21 AND (NOT age:<:30) OR age:=:10`\
or\
`(age:>:21 AND NOT age:<:30) OR age:=:10`

*TEST THIS*

Cuts and encapsulations can be nested using parentheses:\
<img src="readme_images/nested_parens.png" alt="basic" height="91px">

## Why "Lapidary" though?

```
lapidary (noun): a person who cuts, polishes, or engraves gems.
```

The cuts on a gem are called facets. This library uses the word 'facet' to refer to any property of an item. It lets you 'cut' (filter) your data along any facets you want :)

Oh and to continue the gem metaphor the logo color is the [hex for sapphire](https://www.colorhexa.com/0f52ba)
