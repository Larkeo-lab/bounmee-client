// Just verifying the code snippet in CreateWorkflow.tsx
const node = {
  data: {
    inputFields: [{ id: '1', label: 'Test', type: 'text', required: true }],
    sampleDocuments: [{ id: 'doc1', name: 'Document 1' }]
  }
};
console.log("Input Fields:", node.data.inputFields);
console.log("Sample Documents:", node.data.sampleDocuments);
