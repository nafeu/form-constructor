import React, { Fragment, useState, useEffect, useRef } from "react";
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
  ListGroupItem,
  Card,
  CardBody,
  CardTitle
} from 'reactstrap';

import { v1 as uniqueId } from 'uuid';
import { keys } from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Title from "./components/title";
import Footer from "./components/footer";
import Molecule from "./components/molecule";
import { parseId, getKeyLabel, formatHtml } from './utils/helpers';
import { FIRST_ITEM, ONE_SECOND } from './utils/constants';
import {
  formMolecules,
  availableMolecules,
  processOrganism,
  buildPayload
} from './services/form-builder';

function App() {
  const formElement = useRef(null);

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

  const [isCopied, setIsCopied] = useState({
    'organism': false,
    'formFields': false,
    'payload': false,
    'html': false
  });

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

  const handleClickCopyToClipboard = codeKey => {
    setIsCopied({ ...isCopied, [codeKey]: true });

    setTimeout(() => {
      setIsCopied({ ...isCopied, [codeKey]: false });
    }, ONE_SECOND)
  }

  const organismCode = JSON.stringify(organism, null, 2);
  const formFieldsCode = JSON.stringify(formFields, null, 2);
  const payloadCode = JSON.stringify(payload, null, 2);
  const htmlCode = formatHtml(formElement?.current?.innerHTML || '');

  return (
    <div className="app">
      <div className="app-container">
        <Title />

        <Container className="mb-4" fluid>
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
                    className="m-1"
                    onClick={handleClickAddMolecule}
                  >
                    Add Form Field
                  </Button>
                  <Button
                    color={isShowingCodePreview ? 'info' : 'secondary'}
                    className="m-1"
                    onClick={handleClickToggleDevMode}
                  >
                    {isShowingCodePreview ? 'Hide Code' : 'Show Code'}
                  </Button>
                </FormGroup>
              </Form>

              <Form>
                {organism.molecules.length > 0 && organism.molecules.map(molecule => {
                  return (
                    <Fragment key={molecule.id}>
                      <Card className="mb-4">
                        <CardBody>
                          <CardTitle tag="h5">{molecule.label}</CardTitle>
                          <Row form>
                            {molecule.atoms.map(atom => {
                              return (
                                <Col xs={molecule.atoms.length >= 3 ? '4' : ''} key={atom.id}>
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
                        </CardBody>
                      </Card>
                    </Fragment>
                  );
                })}
              </Form>
            </Col>
            {isShowingCodePreview && (
              <Col xs="6">
                <CopyToClipboard
                  text={organismCode}
                  onCopy={() => handleClickCopyToClipboard('organism')}
                >
                  <Button
                    outline
                    color="primary"
                    size="sm"
                    className="mb-2"
                  >
                    {isCopied.organism ? 'Copied.' : 'Copy To Clipboard'}
                  </Button>
                </CopyToClipboard>
                <br/>
                <pre>
                  {organismCode}
                </pre>
              </Col>
            )}
          </Row>

          <hr/>

          {organism.molecules.length > 0 && (
            <Fragment>
              <h4>Preview Form</h4>
              <Row>
                <Col xs={isShowingCodePreview ? '6' : '12'}>
                  <Card>
                    <CardBody>
                      <CardTitle><strong>{organism.name || '[Untitled Form]'}</strong></CardTitle>
                      <div ref={formElement}>
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
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                {isShowingCodePreview && (
                  <Col xs="6">
                    <CopyToClipboard
                      text={formFieldsCode}
                      onCopy={() => handleClickCopyToClipboard('formFields')}
                    >
                      <Button
                        outline
                        color="primary"
                        size="sm"
                        className="mb-2"
                      >
                        {isCopied.formFields ? 'Copied.' : 'Copy To Clipboard'}
                      </Button>
                    </CopyToClipboard>
                    <br/>
                    <pre>
                      {formFieldsCode}
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
                <CopyToClipboard
                  text={payloadCode}
                  onCopy={() => handleClickCopyToClipboard('payload')}
                >
                  <Button
                    outline
                    color="primary"
                    size="sm"
                    className="mb-2"
                  >
                    {isCopied.payload ? 'Copied.' : 'Copy To Clipboard'}
                  </Button>
                </CopyToClipboard>
                <br/>
                <pre>
                  {payloadCode}
                </pre>
              </Col>
            )}
          </Row>

          {organism.molecules.length > 0 && (
            <Fragment>
              <hr/>
              <h4>Get HTML</h4>
              <Row>
                <Col>
                  <CopyToClipboard
                    text={htmlCode}
                    onCopy={() => handleClickCopyToClipboard('html')}
                  >
                    <Button
                      outline
                      color="primary"
                      size="sm"
                      className="mb-2"
                    >
                      {isCopied.html ? 'Copied.' : 'Copy To Clipboard'}
                    </Button>
                  </CopyToClipboard>
                  <br/>
                  <pre>
                    {htmlCode}
                  </pre>
                </Col>
              </Row>
            </Fragment>
          )}
        </Container>

        <Footer />
      </div>
    </div>
  );
}

export default App;
