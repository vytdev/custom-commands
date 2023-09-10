# Command Flag Builder (CommandFlag)

## Constructor:

- **`long`**:
  - **Description:** The long-form name of the flag.
  - **Type:** string

- **`short`** (optional):
  - **Description:** The short-form name of the flag.
  - **Type:** string (optional)

- **`id`** (optional):
  - **Description:** The identifier used to specify where the parsed flag value is placed. If not provided, it defaults to the flag's long name.
  - **Type:** string (optional)

## Static Method

#### `from`

Create a new `CommandFlag` instance from an object definition.

## Instance Properties

- **`dest`**:
  - **Description:** The destination where the parsed flag value is placed.
  - **Type:** string

- **`long`**:
  - **Description:** The long-form name of the flag.
  - **Type:** string

- **`short`** (optional):
  - **Description:** The short-form name of the flag.
  - **Type:** string (optional)

- **`help`**:
  - **Description:** The help message explaining the flag's purpose.
  - **Type:** string

- **`args`**:
  - **Description:** An array of `CommandArgument` instances representing arguments within the flag.
  - **Type:** CommandArgument[]

## Instance Methods

#### `setHelp`

Set the help message for this flag.

#### `addArgument`

Add an argument to this flag.
