var debug = require('debug')('chi-square');
var _ = require('lodash');
var simpleStats = require('simple-statistics');
var isArray = require('util').isArray;

module.exports = ChiSquare;

function ChiSquare(vectors, opts) {
  if (!(this instanceof ChiSquare)) return new ChiSquare(vectors, opts);
  if (!opts) opts = {};

  // lets assume that vectors is an object
  if (!vectors || !vectors.length) throw new Error('vectors cannot be empty');

  // check to make sure all the data has the same shape
  assertVectorShape(vectors);

  this.vectors = vectors;

  debug('summing vectors');
  // sum up each of the vectors (rows)
  var vectorSums = _.map(vectors, simpleStats.sum);

  // sum up each of the features (columns)
  var featureSums = sumFeatures(vectors);
  // sum all the sums
  var totalFeatureSum = simpleStats.sum(featureSums); // used to calc the feature weight
  // need to get weights for features by putting the sum of each feature over the totalFeatureSum
  this.featureWeights = _.map(featureSums, function(featureSum) {
    return featureSum / totalFeatureSum;
  });

  // adjust the vectors to be relative
  this.relativeVectors = calcRelativeAbdVectors(vectors, vectorSums);

  if (opts.preCompute) {
    // find the similarity between all the points, build it as a matrix
    // this will be an array of arrays
    // it will be in the same order as the vectors
    this.neighbors = [];

    debug('calculating neighbors for %d vectors', vectors.length);
    for (var vectorIndex = 0; vectorIndex < vectors.length; vectorIndex++) {
      this.neighbors.push(calculateDistances.call(this, vectorIndex));
    };
  }

  return this;
}

ChiSquare.prototype.knn = function(subject, n) {
  if (typeof n !== 'number') n = 10; // if they didn't specify an n value

  // get n number of nearest neighbors given either the vector or an index to the vector
  var vectorIndex;
  if (typeof subject === 'number') {
    vectorIndex = subject;
  } else if (isArray(subject)) {
    vectorIndex = findIndex(this.vectors, subject);
  } else {
    throw new Error('subject must be either a vector or an index to a vector');
  }

  var vectorNeighbors;
  if (this.neighbors) {
    vectorNeighbors = this.neighbors[vectorIndex];
  } else {
    // calculate the neighbors on the fly for this vector
    vectorNeighbors = calculateDistances.call(this, vectorIndex);
  }

  // we only want to return n neighbors
  return vectorNeighbors.slice(0, n);
}

function calcRelativeAbdVectors(vectors, vectorSums) {
  debug('calculating relative abds for vectors');
  var relativeVectors = [];
  // divide each feature abd by the vector sum for each vector
  var vector;
  var relativeVector;
  var vectorSum;
  for (var vectorIndex = 0; vectorIndex < vectors.length; vectorIndex++) {
    vector = vectors[vectorIndex];
    relativeVector = [];
    relativeVectors.push(relativeVector);
    vectorSum = vectorSums[vectorIndex];
    for (var featureIndex = 0; featureIndex < vector.length; featureIndex++) {
      relativeVector.push(vector[featureIndex] / vectorSum);
    };
  };
  return relativeVectors;
}

function sumFeatures(vectors) {
  debug('summing features');
  var featureSums = [];
  var numFeatures = vectors[0].length;

  // init the array with zeros
  for (var i = numFeatures - 1; i >= 0; i--) {
    featureSums.push(0);
  };

  var vector;
  for (var vectorIndex = vectors.length - 1; vectorIndex >= 0; vectorIndex--) {
    vector = vectors[vectorIndex];
    for (var featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
      featureSums[featureIndex] += vector[featureIndex];
    }
  }

  return featureSums;
}

function findIndex(vectors, subject) {
  var i;
  for (i = vectors.length - 1; i >= 0; i--) {
    if (_.isEqual(vectors[i], subject)) break;
  };
  if (i < 0) {
    debug('subject not found in vectors: %j', subject);
    throw new Error('subject not found in vectors');
  }
  return i;
}


function assertVectorShape(vectors) {
  debug('asserting vector shapes');
  var firstVectorLength = vectors[0].length;
  for (var i = vectors.length - 1; i >= 0; i--) {
    if (vectors[i].length !== firstVectorLength) throw new Error('all vectors must have the same shape');
  };
}

/**
 * given an index, calculate the similarity of that vector to the other vectors
 * this should return an array of objects with a similarity score and the vector
 */
function calculateDistances(currentVectorIndex) {
  debug('calculateDistances for vector: %d', currentVectorIndex);

  var vectorNeighbors = [];
  var diss;
  for (var i = 0; i < this.vectors.length; i++) {
    // calculate the similarity between the two vectors
    vectorNeighbors.push({
      d: calculateDistanceBetweenVectors.call(this, currentVectorIndex, i),
      vector: this.vectors[i]
    });
  }

  debug('sorting results for vector: %d', currentVectorIndex);
  // sort the vectorNeighbors by the d value, in asc order (lower numbers being more similar)
  vectorNeighbors = _.sortBy(vectorNeighbors, 'd');
  debug('sorted results for vector: %d', currentVectorIndex);

  return vectorNeighbors;
}

function calculateDistanceBetweenVectors(vectorAIndex, vectorBIndex) {
  // this is simply weighted Euclidean distance
  var vectorA = this.relativeVectors[vectorAIndex];
  var vectorB = this.relativeVectors[vectorBIndex];

  if (vectorA.length !== vectorB.length) throw new Error('cannot compare vectors of different length');

  var differenceSum = 0;
  var numFeatures = vectorA.length;
  for (var featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
    differenceSum += this.featureWeights[featureIndex] * Math.pow(vectorA[featureIndex] - vectorB[featureIndex], 2);
  }

  return Math.sqrt(differenceSum);
}
