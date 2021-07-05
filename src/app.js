import React, { Fragment, useState, useRef, useEffect } from "react";
import "./app.css";

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  ListGroup,
  ListGroupItem
} from 'reactstrap';

import { v1 as uniqueId } from 'uuid';
import { keys } from 'lodash';

import Title from "./components/title";
import Footer from "./components/footer";
import Molecule from "./components/molecule";
import { parseId, getKeyLabel } from './utils/helpers';
import { FIRST_ITEM } from './utils/constants';
import {
  formMolecules,
  availableMolecules,
  processOrganism,
  buildPayload
} from './services/form-builder';

function App() {
  const [isShowingCodePreview, setIsDevMode] = useState(true);
  const [organism, setOrganism] = useState({
    id: `organism-${uniqueId()}`,
    name: '',
    molecules: [],
  });

  const [selectedMolecule, setSelectedMolecule] = useState(
    formMolecules[availableMolecules[FIRST_ITEM]].build()
  );

  const [formFields, setFormFields] = useState(processOrganism(organism));
  const [payload, setPayload] = useState(buildPayload({ organism, formFields }));

  useEffect(() => {
    setFormFields(processOrganism(organism));
  }, [organism])

  useEffect(() => {
    const updatedPayload = buildPayload({ organism, formFields });

    setPayload(updatedPayload);
  }, [organism, formFields]);

  const handleClickToggleDevMode = () => {
    setIsDevMode(!isShowingCodePreview);
  }

  const handleChangeText = event => {
    setOrganism({
      ...organism,
      name: event.target.value
    });
  }

  const handleSelectMolecule = event => {
    const moleculeId = event.target.value;

    setSelectedMolecule(formMolecules[moleculeId].build());
  }

  const handleClickAddMolecule = () => {
    const moleculeId = parseId(selectedMolecule.id);

    setOrganism({
      ...organism,
      molecules: [
        ...organism.molecules,
        formMolecules[moleculeId].build(uniqueId())
      ]
    })
  }

  const handleChangeAtom = ({ atomId, moleculeId, event }) => {
    const updatedOrganism = {
      ...organism,
      molecules: organism.molecules.map(molecule => {
        if (molecule.id === moleculeId) {
          return {
            ...molecule,
            atoms: molecule.atoms.map(atom => {
              if (atom.id === atomId) {
                return {
                  ...atom,
                  value: event.target.value
                }
              }

              return atom;
            })
          }
        }

        return molecule;
      })
    }

    setOrganism(updatedOrganism);
  }

  const handleClickDelete = ({ moleculeId }) => {
    const updatedOrganism = {
      ...organism,
      molecules: organism.molecules.filter(molecule => {
        return molecule.id !== moleculeId;
      })
    }

    setOrganism(updatedOrganism);
  }

  const handleClickDuplicate = ({ moleculeToDuplicate }) => {
    const key = uniqueId();

    const updatedOrganism = {
      ...organism,
      molecules: [...organism.molecules, {
        ...moleculeToDuplicate,
        id: `${parseId(moleculeToDuplicate.id)}|${key}`,
        atoms: moleculeToDuplicate.atoms.map(atom => ({
          ...atom,
          id: `${parseId(atom.id)}|${key}`
        }))
      }]
    }

    setOrganism(updatedOrganism);
  }

  const handleChangeFormField = ({ formFieldId, value }) => {
    setFormFields(formFields.map(formField => {
      if (formField.id === formFieldId) {
        return {
          ...formField,
          value
        }
      }

      return formField;
    }));
  }

  return (
    <div className="app">
      <div className="app-container">
        <Title />

        <Container className="mb-4">
          <h4>Construct Form</h4>
          <Row>
            <Col xs={isShowingCodePreview ? '6' : '12'}>
              <Form>
                <FormGroup>
                  <Label for="formName">Form Name</Label>
                  <Input
                    type="text"
                    id="formName"
                    placeholder="Enter name"
                    value={organism.name}
                    onChange={handleChangeText}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="selectMolecule">Select Form Field</Label>
                  <Input
                    type="select"
                    id="selectMolecule"
                    placeholder="Select form field"
                    value={parseId(selectedMolecule.id)}
                    onChange={handleSelectMolecule}
                  >
                    {availableMolecules.map(id => {
                      const moleculeId = parseId(id);
                      const { label } = formMolecules[moleculeId].build();

                      return (
                        <option
                          key={id}
                          value={moleculeId}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Button
                    color="success"
                    className="mr-2"
                    onClick={handleClickAddMolecule}
                  >
                    Add Form Field
                  </Button>
                  <Button
                    onClick={handleClickToggleDevMode}
                    color={isShowingCodePreview ? 'info' : 'secondary'}
                  >
                    {isShowingCodePreview ? 'Hide Code' : 'Show Code'}
                  </Button>
                </FormGroup>
              </Form>
              <hr/>
              <Form>
                {organism.molecules.length > 0 && organism.molecules.map(molecule => {
                  return (
                    <Fragment key={molecule.id}>
                      <Row form>
                        {molecule.atoms.map(atom => {
                          return (
                            <Col key={atom.id}>
                              <FormGroup>
                                <Label for={atom.id}>{atom.label}</Label>
                                <Input
                                  type={atom.type}
                                  id={atom.id}
                                  placeholder={atom.placeholder}
                                  onChange={event => handleChangeAtom({
                                    atomId: atom.id,
                                    moleculeId: molecule.id,
                                    event
                                  })}
                                  value={atom.value}
                                />
                              </FormGroup>
                            </Col>
                          );
                        })}
                      </Row>
                      <Row form>
                        <Col>
                          <FormGroup>
                            <Button
                              color="danger"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleClickDelete({ moleculeId: molecule.id })}
                            >
                              Delete
                            </Button>
                            <Button
                              color="primary"
                              size="sm"
                              onClick={() => handleClickDuplicate({ moleculeToDuplicate: molecule })}
                            >
                              Duplicate
                            </Button>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Fragment>
                  );
                })}
              </Form>
            </Col>
            {isShowingCodePreview && (
              <Col xs="6">
                <pre style={{ fontSize: '0.75em' }}>
                  {JSON.stringify(organism, null, 2)}
                </pre>
              </Col>
            )}
          </Row>

          <hr/>

          {organism.molecules.length > 0 && (
            <Fragment>
              <h4>Confirm Fields</h4>
              <Row>
                <Col xs={isShowingCodePreview ? '6' : '12'}>
                  {formFields.length > 0 && formFields.map(formField => {
                    return (
                      <Row key={formField.id} form>
                        <Col>
                          <Molecule
                            formField={formField}
                            onChangeFormField={handleChangeFormField}
                          />
                        </Col>
                      </Row>
                    );
                  })}
                </Col>
                {isShowingCodePreview && (
                  <Col xs="6">
                    <pre>
                      {JSON.stringify(formFields, null, 2)}
                    </pre>
                  </Col>
                )}
              </Row>

              <hr/>
            </Fragment>
          )}

          <h4>Preview Form Data</h4>
          <Row>
            <Col xs={isShowingCodePreview ? '6' : '12'}>
              <ListGroup>
                {keys(payload).map(key => {
                  if (key === 'id') {
                    return '';
                  }

                  return (
                    <ListGroupItem key={key}>
                      {getKeyLabel({ key, formFields })}: <strong>{payload[key]}</strong>
                    </ListGroupItem>
                  );
                })}
              </ListGroup>
            </Col>
            {isShowingCodePreview && (
              <Col xs="6">
                <pre>
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </Col>
            )}
          </Row>
        </Container>

        <Footer />
      </div>
    </div>
  );
}

export default App;
