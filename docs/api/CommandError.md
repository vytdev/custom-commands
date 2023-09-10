# Command Error (CommandError)

## Constructor

- **`msg`**:
  - **Description:** The error message to be displayed.
  - **Type:** string

- **`start`** (optional):
  - **Description:** Offset of the syntax error, indicating the starting position.
  - **Type:** number (optional)

- **`end`** (optional):
  - **Description:** Offset of the syntax error, indicating the ending position.
  - **Type:** number (optional)

## Instance Properties

- **`message`**:
  - **Description:** The error message.
  - **Type:** string

- **`token`**:
  - **Description:** The token where this error occurred.
  - **Type:** CommandToken

- **`command`**:
  - **Description:** The command that resulted in this error.
  - **Type:** string

- **`start`**:
  - **Description:** The starting index offset of the syntax error.
  - **Type:** number

- **`end`**:
  - **Description:** The ending index offset of the syntax error.
  - **Type:** number

- **`syntax`**:
  - **Description:** Indicates whether it's a syntax error.
  - **Type:** boolean

## Instance Methods

- **`getStack`**:
  - **Description:** Retrieve the syntax error stack trace.
  - **Parameters:**
    - **`offset`** (optional):
      - **Description:** An optional offset length of the string to show in the start and end of the error origin.
      - **Type:** number (optional)
  - **Returns:** string

- **`toString`**:
  - **Description:** Get a string representation of the error.
  - **Returns:** string
