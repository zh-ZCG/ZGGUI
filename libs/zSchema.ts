type ValidationError = {
  message: string
  field: string
  fullField: string
  type: string
}

type Rule = {
  type?: string
  required?: boolean
  pattern?: RegExp
  message?: string
  asyncValidator?: (
    rule: Rule,
    value: any,
    callback: (errors?: ValidationError[] | null) => void,
    source: any,
    options: any
  ) => Promise<void> | void
  validator?: (
    rule: Rule,
    value: any,
    callback: (errors?: ValidationError[] | null) => void,
    source: any,
    options: any
  ) => boolean | ValidationError[] | Error | void | Promise<void>
  transform?: (value: any) => any
  fields?: Record<string, Rule | Rule[]>
  defaultField?: Rule
  fullField?: string
  [key: string]: any
}

interface MessageTypeObject {
  [key: string]: string | MessageTypeObject
}

type MessageType = MessageTypeObject

function newMessages(): MessageType {
  return {
    default: 'Validation error on field %s',
    required: '%s is required',
    enum: '%s must be one of %s',
    whitespace: '%s cannot be empty',
    date: {
      format: '%s date %s is invalid for format %s',
      parse: '%s date could not be parsed, %s is invalid',
      invalid: '%s date %s is invalid',
    },
    types: {
      string: '%s is not a %s',
      method: '%s is not a %s (function)',
      array: '%s is not an %s',
      object: '%s is not an %s',
      number: '%s is not a %s',
      date: '%s is not a %s',
      boolean: '%s is not a %s',
      integer: '%s is not an %s',
      float: '%s is not a %s',
      regexp: '%s is not a valid %s',
      email: '%s is not a valid %s',
      url: '%s is not a valid %s',
      hex: '%s is not a valid %s',
    },
    string: {
      len: '%s must be exactly %s characters',
      min: '%s must be at least %s characters',
      max: '%s cannot be longer than %s characters',
      range: '%s must be between %s and %s characters',
    },
    number: {
      len: '%s must equal %s',
      min: '%s cannot be less than %s',
      max: '%s cannot be greater than %s',
      range: '%s must be between %s and %s',
    },
    array: {
      len: '%s must be exactly %s in length',
      min: '%s cannot be less than %s in length',
      max: '%s cannot be greater than %s in length',
      range: '%s must be between %s and %s in length',
    },
    pattern: {
      mismatch: '%s value %s does not match pattern %s',
    },
    // clone: function clone() {
    //   const cloned = JSON.parse(JSON.stringify(this))
    //   cloned.clone = this.clone
    //   return cloned
    // },
  }
}

const messages = newMessages()

interface SchemaOptions {
  messages?: MessageType
  keys?: string[]
  suppressWarning?: boolean
  first?: boolean
  error?: (rule: Rule, message: string) => ValidationError
}

type ValidationCallback = (
  errors?: ValidationError[] | null,
  fields?: Record<string, ValidationError[]>
) => void

interface ValidatorFunction {
  (
    rule: Rule,
    value: any,
    callback: ValidationCallback,
    source: any,
    options: SchemaOptions
  ): void
}

type Validators = Record<string, ValidatorFunction>

const validators: Validators = {
  // Add your validators here
  required: (rule, value, callback) => {
    if (value === undefined || value === null || value === '') {
      callback([
        {
          message: rule.message || 'Field is required',
          field: rule.field!,
          fullField: rule.fullField!,
          type: rule.type!,
        },
      ])
    } else {
      callback()
    }
  },
  string: (rule, value, callback) => {
    if (typeof value !== 'string') {
      callback([
        {
          message: rule.message || 'Field must be a string',
          field: rule.field!,
          fullField: rule.fullField!,
          type: rule.type!,
        },
      ])
    } else {
      callback()
    }
  },
}

function deepMerge(target: any, source: any) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) {
          target[key] = {}
        }
        deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }
  return target
}

function format(message: string, ...args: any[]): string {
  return message.replace(/%s/g, () => args.shift())
}

function complementError(rule: Rule): (error: ValidationError) => ValidationError {
  return (error: ValidationError) => {
    error.field = rule.fullField!
    error.type = rule.type!
    return error
  }
}

function convertFieldsError(
  errors: ValidationError[]
): Record<string, ValidationError[]> {
  const fields: Record<string, ValidationError[]> = {}
  errors.forEach(error => {
    const field = error.field
    fields[field] = fields[field] || []
    fields[field].push(error)
  })
  return fields
}

function asyncMap(
  series: Record<string, any[]>,
  options: SchemaOptions,
  iterator: (data: any, callback: (errors: ValidationError[] | null) => void) => void,
  callback: (results: ValidationError[][]) => void
): void {
  const results: ValidationError[][] = []
  const keys = Object.keys(series)
  let remaining = keys.length

  if (!remaining) {
    callback(results)
    return
  }

  function done(errors: ValidationError[] | null) {
    results.push(errors || [])
    if (--remaining === 0) {
      callback(results)
    }
  }

  keys.forEach(key => {
    const tasks = series[key]
    tasks.forEach(task => {
      iterator(task, done)
    })
  })
}

class Schema {
  rules: Record<string, Rule[]> | null
  _messages: MessageType

  constructor(descriptor: Record<string, Rule | Rule[]>) {
    this.rules = null
    this._messages = messages
    this.define(descriptor)
  }

  messages(_messages?: MessageType): MessageType {
    if (_messages) {
      this._messages = deepMerge(newMessages(), _messages)
    }
    return this._messages
  }

  define(rules: Record<string, Rule | Rule[]>): void {
    if (!rules) {
      throw new Error('Cannot configure a schema with no rules')
    }

    if (typeof rules !== 'object' || Array.isArray(rules)) {
      throw new Error('Rules must be an object')
    }

    this.rules = {}
    for (const z in rules) {
      if (rules.hasOwnProperty(z)) {
        const item = rules[z]
        this.rules[z] = Array.isArray(item) ? item : [item]
      }
    }
  }

  validate(
    source_: Record<string, any>,
    o?: SchemaOptions,
    oc?: ValidationCallback
  ): Promise<void> {
    const _this = this

    let options = o || {}
    let callback = oc || function () {}

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (!this.rules || Object.keys(this.rules).length === 0) {
      if (callback) {
        callback()
      }
      return Promise.resolve()
    }

    function complete(results: ValidationError[][]) {
      let errors: ValidationError[] = []
      let fields: Record<string, ValidationError[]> = {}

      function add(e: ValidationError | ValidationError[]) {
        if (Array.isArray(e)) {
          errors = errors.concat(e)
        } else {
          errors.push(e)
        }
      }

      results.forEach(result => add(result))

      if (!errors.length) {
        errors = []
        fields = {}
      } else {
        fields = convertFieldsError(errors)
      }

      callback(errors, fields)
    }

    if (options.messages) {
      let messages$1 = this.messages()
      if (messages$1 === messages) {
        messages$1 = newMessages()
      }
      deepMerge(messages$1, options.messages)
      options.messages = messages$1
    } else {
      options.messages = this.messages()
    }

    const series: Record<string, any[]> = {}
    const keys = options.keys || Object.keys(this.rules)
    keys.forEach(z => {
      const arr = _this.rules![z]
      let value = source_[z]
      arr.forEach(r => {
        let rule = r

        if (typeof rule.transform === 'function') {
          value = source_[z] = rule.transform(value)
        }

        if (typeof rule === 'function') {
          rule = {
            validator: rule,
          }
        } else {
          rule = { ...rule }
        }

        rule.validator = _this.getValidationMethod(rule)
        rule.field = z
        rule.fullField = rule.fullField || z
        rule.type = _this.getType(rule)

        if (!rule.validator) {
          return
        }

        series[z] = series[z] || []
        series[z].push({
          rule,
          value,
          source: source_,
          field: z,
        })
      })
    })

    const errorFields: Record<string, number> = {}
    return new Promise((resolve, reject) => {
      asyncMap(
        series,
        options,
        (data, doIt) => {
          const { rule } = data
          let deep =
            (rule.type === 'object' || rule.type === 'array') &&
            (typeof rule.fields === 'object' || typeof rule.defaultField === 'object')
          deep = deep && (rule.required || (!rule.required && data.value))
          rule.field = data.field

          function addFullfield(key: string, schema: Rule) {
            return { ...schema, fullField: `${rule.fullField}.${key}` }
          }

          function cb(e?: ValidationError[] | null) {
            if (e === void 0) {
              e = []
            }

            let errors = e

            if (!Array.isArray(errors)) {
              errors = errors ? errors : []
            }

            if (!options.suppressWarning && errors.length) {
              Schema.warning('async-validator:', errors)
            }

            if (errors.length && rule.message) {
              errors = [].concat(rule.message)
            }

            errors = errors.map(complementError(rule))

            if (options.first && errors.length) {
              errorFields[rule.field] = 1
              return doIt(errors)
            }

            if (!deep) {
              doIt(errors)
            } else {
              if (rule.required && !data.value) {
                if (rule.message) {
                  errors = [].concat(rule.message).map(complementError(rule))
                } else if (options.error) {
                  errors = [
                    options.error(
                      rule,
                      format(options.messages?.required as string, rule.field)
                    ),
                  ]
                } else {
                  errors = []
                }

                return doIt(errors)
              }

              let fieldsSchema: Record<string, Rule> = {}

              if (rule.defaultField) {
                for (const k in data.value) {
                  if (data.value.hasOwnProperty(k)) {
                    fieldsSchema[k] = rule.defaultField
                  }
                }
              }

              fieldsSchema = { ...fieldsSchema, ...data.rule.fields }

              for (const f in fieldsSchema) {
                if (fieldsSchema.hasOwnProperty(f)) {
                  const fieldSchema = Array.isArray(fieldsSchema[f])
                    ? fieldsSchema[f]
                    : [fieldsSchema[f]]
                  fieldsSchema[f] = fieldSchema.map(addFullfield.bind(null, f))
                }
              }

              const schema = new Schema(fieldsSchema)
              schema.messages(options.messages)

              if (data.rule.options) {
                data.rule.options.messages = options.messages
                data.rule.options.error = options.error
              }

              schema.validate(data.value, data.rule.options || options, errs => {
                const finalErrors: ValidationError[] = []

                if (errors && errors.length) {
                  finalErrors.push.apply(finalErrors, errors)
                }

                if (errs && errs.length) {
                  finalErrors.push.apply(finalErrors, errs)
                }

                doIt(finalErrors.length ? finalErrors : null)
              })
            }
          }

          let res

          if (rule.asyncValidator) {
            res = rule.asyncValidator(rule, data.value, cb, data.source, options)
          } else if (rule.validator) {
            res = rule.validator(rule, data.value, cb, data.source, options)

            if (res === true) {
              cb()
            } else if (res === false) {
              cb(rule.message || `${rule.field} fails`)
            } else if (res instanceof Array) {
              cb(res)
            } else if (res instanceof Error) {
              cb(res.message as any)
            }
          }

          if (res && res.then) {
            res.then(
              () => cb(null),
              (e: ValidationError) => cb([e])
            )
          }
        },
        results => {
          complete(results)
          resolve()
        }
      )
    })
  }

  getType(rule: Rule): string {
    if (rule.type === undefined && rule.pattern instanceof RegExp) {
      rule.type = 'pattern'
    }

    if (
      typeof rule.validator !== 'function' &&
      rule.type &&
      !validators.hasOwnProperty(rule.type)
    ) {
      throw new Error(format('Unknown rule type %s', rule.type))
    }

    return rule.type || 'string'
  }

  getValidationMethod(rule: Rule): ValidatorFunction {
    if (typeof rule.validator === 'function') {
      return rule.validator
    }

    const keys = Object.keys(rule)
    const messageIndex = keys.indexOf('message')

    if (messageIndex !== -1) {
      keys.splice(messageIndex, 1)
    }

    if (keys.length === 1 && keys[0] === 'required') {
      return validators.required
    }

    return validators[this.getType(rule)] || false
  }

  static register(type: string, validator: ValidatorFunction): void {
    if (typeof validator !== 'function') {
      throw new Error(
        'Cannot register a validator by type, validator is not a function'
      )
    }

    validators[type] = validator
  }

  static warning(...args: any[]): void {
    console.warn(...args)
  }

  static messages(): MessageType {
    return messages
  }
}

export default Schema
