# chi-square-nearest-neighbor

Nearest neighbor using chi-square distance.

[![wercker status](https://app.wercker.com/status/edcb7f6c41dbf2620a98bcfe7d7e1073/s "wercker status")](https://app.wercker.com/project/bykey/edcb7f6c41dbf2620a98bcfe7d7e1073)

This is a chi-square implementation for nearest neighbor. More information can be found [here](http://www.econ.upf.edu/~michael/stanford/maeb4.pdf).

*"The chi-square distance is special because it is at the heart of correspondence analysis, extensively used in ecological research. The first premise of this distance function is that it is calculated on relative counts, and not on the original ones, and the second is that it standardizes by the mean and not by the variance."* [[1]](http://www.econ.upf.edu/~michael/stanford/maeb4.pdf)

# methods
```javascript
var ChiSquare = require('chi-square-nearest-neighbor');
```

## var nn = ChiSquare(vectors)

Create a new chi-square nearest neighbor instance. `vector` is an an array (neighbors) of arrays (neighbor features).

### var neighbors = nn.knn(subject, k);

Returns the `k` most nearest neighbors to `subject` (the target neighbor). `k` default is `10`.

Resulting `neighbors` is a sorted, (most similar first) array where each object has the following properties:
  * `vector` - the neighbor vector
  * `d` - the chi-square distance, with zero being the most similar.

# example

```javascript
var ChiSquare = require('chi-square-nearest-neighbor');
var vectors = [
 [26, 4, 13, 11, 0],
  [0, 10, 9, 8, 0],
  [0, 0, 15, 3, 0],
  [13, 5, 3, 10, 7],
  [31, 21, 13, 16, 5],
  [9, 6, 0, 11, 2],
  [32, 26, 0, 23, 0],
  [32, 21, 0, 10, 2],
  [24, 17, 0, 25, 6],
  [16, 3, 12, 20, 2],
  [11, 0, 7, 8, 0],
  [24, 37, 5, 18, 1]
  ];
var nn = new ChiSquare(vectors);

var subject = [32, 26, 0, 23, 0];
var mostSimilar = [24, 17, 0, 25, 6];

var neighbors = nn.knn(subject, 2);
var neighbor = neighbors[1]; // the subject itself should always be returned as the first element because the item will be most similar to itself, so we get the second element
neighbors[0].d.should.eql(0);
neighbor.vector.should.eql(mostSimilar);
```


# License

(The MIT License)

Copyright (c) 2014 Nick Poorman <mail@nickpoorman.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
