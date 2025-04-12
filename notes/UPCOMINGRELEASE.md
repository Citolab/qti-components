7.2.0

💥 Breaking change

| old                | new                | event detail                                                    |
| ------------------ | ------------------ | --------------------------------------------------------------- |
| qti-test-connected | qti-test-connected | detail: QtiTest                                                 |
| qti-test-connected | qti-test-loaded    | detail: { identifier: itemRef?.identifier, element: itemRef }[] |

New attribute: 'navigate'. by default qti-test will not navigate to the first item, you can set navigate=“item | section” if you want that
New method navigateTo('item | section', optional id). When no id is given it will navigate to the first item or section, if you pass an identifier it will navigate te the specific item or section. Great for routing
New event qti-test-loaded will throw if an item, or items ( when loading a section ) is ready in the dom
❌ removed nav-item-id from qti-test in favor of navigate and navigateTo method

qti-test
updateItemVariables(itemRefID: string, variables: VariableValue<string | string[] | null>[]): void {

| old                 | new                       |
| ------------------- | ------------------------- |
| testpart?: unknown; | activeTestpart?: unknown; |
| section?: unknown;  | activeSection?: unknown;  |
| item?: unknown;     | activeItem?: unknown;     |
