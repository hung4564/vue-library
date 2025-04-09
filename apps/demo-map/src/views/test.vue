<template lang="">
  <div></div>
</template>
<script setup>
import {
  CompositeDatasetHandler,
  createDataset,
  createDatasetHandlerChain,
  DataCollectorVisitor,
  DatasetFinderVisitor,
  LeafDatasetHandler,
  PathBuilderVisitor,
  RootFinderVisitor,
  runFromLeaf,
  TransformDatasetHandler,
  ValidationDatasetHandler,
} from '@hungpvq/vue-map-dataset';

// Create some datasets
const leafDataset = createDataset('LeafChid', { value: 42 });
const child1 = createDataset('Child1', { value: 1 });
const child2 = createDataset('Child2', { value: 2 });
const compositeDataset = createDataset('MyCollection', null, true);
const root = createDataset('MyCollection2', null, true);

// Create handlers
const validationHandler = new ValidationDatasetHandler();
const leafHandler = new LeafDatasetHandler();
const compositeHandler = new CompositeDatasetHandler();
const transformHandler = new TransformDatasetHandler((dataset) => {
  // Example transformation: add a timestamp to the dataset name
  const name = dataset.getName();
  const timestamp = new Date().toISOString();
  return createDataset(
    `${name}_${timestamp}`,
    dataset.getData(),
    'getChildren' in dataset
  );
});

// Create a chain of handlers
const handlerChain = createDatasetHandlerChain(
  validationHandler,
  leafHandler,
  compositeHandler,
  transformHandler
);

// Process datasets through the chain
const processedLeaf = handlerChain.handle(leafDataset);
const processedComposite = handlerChain.handle(compositeDataset);
processedComposite.add(processedLeaf);
root.add(processedComposite);
root.add(child2);
processedComposite.add(child1);

// Get data from either
console.log(leafDataset.getData());
console.log(compositeDataset.getData());
console.log(processedLeaf.getParent());

// Find a dataset by name
const finder = new DatasetFinderVisitor('Child1');
root.accept(finder);
const foundDataset = finder.getFoundDataset();
console.log('Find', 'foundDataset', foundDataset);

// Find the root dataset
const rootFinder = new RootFinderVisitor();
leafDataset.accept(rootFinder);
const rootDataset = rootFinder.getRootDataset();
console.log('Find', 'rootDataset', rootDataset);

// Build a path from root to a target dataset
const pathBuilder = new PathBuilderVisitor('Child2');
root.accept(pathBuilder);
const path = pathBuilder.getPath();
console.log('Find', 'path', path);

// Collect data from all datasets
const collector = new DataCollectorVisitor();
root.accept(collector);
const allData = collector.getCollectedData();
console.log('Find', 'allData', allData);
// Suppose you have a leaf node called 'leafNode'
const leafNode = leafDataset; // This is a leaf node you have access to

// Define functions to apply to other leaves
const updateFunction1 = (dataset) => {
  // Update the dataset in some way
  const data = dataset.getData();
  data.someProperty = 'new value';
  dataset.setData(data);
  return ['Updated with function 1', data];
};

const updateFunction2 = (dataset) => {
  // Another update function
  const data = dataset.getData();
  data.anotherProperty = 42;
  dataset.setData(data);
  return ['Updated with function 2', data];
};

// Run these functions from this leaf on all other leaves
const results = runFromLeaf(leafNode, [updateFunction1, updateFunction2]);

// Process the results
results.forEach((leafResults, leafName) => {
  console.log(`Results for leaf ${leafName}:`, leafResults);
});
</script>
<style lang=""></style>
