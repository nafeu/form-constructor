import React from "react";
import { each, keys } from 'lodash';
import { parseId } from '../../utils/helpers';
import { FormGroup, Label, Row, Col, ButtonGroup, Button, Input, Badge } from 'reactstrap';

const getInputProps = formField => {
  const inputProps = {}

  each(keys(formField), key => {
    if (key !== 'label') {
      inputProps[key] = formField[key];
    }
  });

  return inputProps;
}

const Molecule = ({ formField, onChangeFormField }) => {
  const moleculeId = parseId(formField.id);

  if (moleculeId === 'yesnoMolecule') {
    return (
      <FormGroup>
        <Label for={formField.id}>{formField.label}</Label>
        <Row>
          <Col>
            <ButtonGroup>
              <Button
                color={formField.value === 'yes' ? "primary" : "secondary"}
                onClick={() => onChangeFormField({ formFieldId: formField.id, value: 'yes' })}
                active={formField.value === 'yes'}
              >
                Yes
              </Button>
              <Button
                color={formField.value === 'no' ? "primary" : "secondary"}
                onClick={() => onChangeFormField({ formFieldId: formField.id, value: 'no' })}
                active={formField.value === 'no'}
              >
                No
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </FormGroup>
    );
  }

  if (moleculeId === 'rangeMolecule') {
    return (
      <FormGroup>
        <Label for={formField.id}>{formField.label} <Badge color="primary">{formField.value}</Badge></Label>
        <Input
          id={formField.id}
          onChange={event => onChangeFormField({ formFieldId: formField.id, value: event.target.value })}
          {...getInputProps(formField)}
          name={formField.key || formField.id}
        />
      </FormGroup>
    );
  }

  return (
    <FormGroup>
      <Label for={formField.id}>{formField.label}</Label>
      <Input
        id={formField.id}
        onChange={event => onChangeFormField({ formFieldId: formField.id, value: event.target.value })}
        {...getInputProps(formField)}
        name={formField.key || formField.id}
      />
    </FormGroup>
  );
}

export default Molecule;
