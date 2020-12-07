import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import styled from 'styled-components';

import { Field } from '@atlaskit/form';
import { RadioGroup } from '@atlaskit/radio';
import { DatePicker } from '@atlaskit/datetime-picker';
import TextField from '@atlaskit/textfield';
import {
  DateRangeField,
  DateRangeResult,
} from '@atlaskit/editor-common/extensions';

import { messages } from '../messages';
import FieldMessages from '../FieldMessages';
import { validate, validateRequired } from '../utils';
import { OnBlur } from '../types';

const HorizontalFields = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const HorizontalFieldWrapper = styled.div`
  flex-basis: 47%;
`;

const Hidden = styled.div`
  display: none;
`;

const getFromDefaultValue = (
  field: DateRangeField,
  attribute: keyof DateRangeResult,
): string | undefined => {
  if (field.defaultValue) {
    return field.defaultValue[attribute];
  }
};

const DateField = ({
  parentField,
  scope,
  fieldName,
  onBlur,
  intl,
}: {
  parentField: DateRangeField;
  scope: string;
  fieldName: 'from' | 'to';
  onBlur: OnBlur;
} & InjectedIntlProps) => (
  <HorizontalFieldWrapper key={fieldName}>
    <Field
      name={`${scope}.${fieldName}`}
      label={intl.formatMessage(messages[fieldName])}
      defaultValue={getFromDefaultValue(
        parentField,
        fieldName as keyof DateRangeResult,
      )}
      isRequired
      validate={(value?: string) =>
        validateRequired<string | undefined>({ isRequired: true }, value)
      }
    >
      {({ fieldProps, error }) => (
        <Fragment>
          <DatePicker
            {...fieldProps}
            onChange={(date: string) => {
              fieldProps.onChange(date);
              onBlur(parentField.name);
            }}
            locale={intl.locale}
          />
          <FieldMessages error={error} />
        </Fragment>
      )}
    </Field>
  </HorizontalFieldWrapper>
);

const DateRange = function ({
  name,
  field,
  onBlur,
  intl,
}: {
  name: string;
  field: DateRangeField;
  onBlur: OnBlur;
  autoFocus?: boolean;
  placeholder?: string;
} & InjectedIntlProps) {
  const items = useMemo(() => {
    return [
      ...(field.items || []),
      {
        label: intl.formatMessage(messages.custom),
        value: 'custom',
      },
    ].map(option => ({
      ...option,
      name,
    }));
  }, [field.items, name, intl]);

  const [currentValue, setCurrentValue] = useState(
    getFromDefaultValue(field, 'value') || items[0].value,
  );

  useEffect(() => {
    // calling onBlur here based on the currentValue changing will ensure that we
    // get the most up to date value after the form has been rendered
    onBlur(name);
  }, [currentValue, onBlur, name]);

  const element = (
    <Fragment>
      <Hidden>
        <Field name={`${name}.type`} defaultValue={'date-range'}>
          {({ fieldProps }) => <TextField {...fieldProps} type="hidden" />}
        </Field>
      </Hidden>
      <Field
        name={`${name}.value`}
        label={field.label}
        defaultValue={currentValue}
        isRequired={field.isRequired}
        validate={(value?: string) => validate<string>(field, value || '')}
      >
        {({ fieldProps, error, valid }) => (
          <Fragment>
            <RadioGroup
              {...fieldProps}
              options={items}
              onChange={event => {
                fieldProps.onChange(event.target.value);
                setCurrentValue(event.target.value);
              }}
            />
            <FieldMessages error={error} />
          </Fragment>
        )}
      </Field>
      {currentValue !== 'custom' ? (
        <Hidden>
          {/** this is a hidden field that will copy the selected value to a field of name 'from'
           *  when a option that is NOT 'custom' is selected. This is to comply with the atlaskit
           * form component that relies on final-form */}
          <Field name={`${name}.from`} defaultValue={currentValue}>
            {({ fieldProps }) => <TextField {...fieldProps} type="hidden" />}
          </Field>
        </Hidden>
      ) : (
        <HorizontalFields>
          <DateField
            scope={name}
            parentField={field}
            fieldName="from"
            onBlur={onBlur}
            intl={intl}
          />
          <DateField
            scope={name}
            parentField={field}
            fieldName="to"
            onBlur={onBlur}
            intl={intl}
          />
        </HorizontalFields>
      )}

      <FieldMessages description={field.description} />
    </Fragment>
  );

  return element;
};

export default injectIntl(DateRange);
