const products = [
  { id: 0, name: "Test" },
  { id: 1, name: "Test2" },
  { id: 2, name: "Test3" },
]

for (const product of products) {
  const divElement = document.createElement("div");
  divElement.dataset.id = product.id;
  divElement.dataset.name = product.name;
  document.body.appendChild(divElement);
}
