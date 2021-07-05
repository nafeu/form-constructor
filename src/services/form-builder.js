import { each, keys } from 'lodash';
import { formatDate, parseId } from '../utils/helpers';

export const formMolecules = {
  textMolecule: {
    build: key => ({
      id: `textMolecule|${key}`,
      label: 'Text',
      atoms: [
        {
          id: `promptAtom|${key}`,
          label: 'Prompt',
          type: 'text',
          placeholder: 'Enter Prompt',
          value: ''
        },
        {
          id: `placeholderAtom|${key}`,
          label: 'Placeholder',
          type: 'text',
          placeholder: 'Enter Placeholder',
          value: ''
        },
        {
          id: `characterLimitAtom|${key}`,
          label: 'Character Limit',
          type: 'number',
          placeholder: 'Enter Character Limit',
          value: 100
        }
      ]
    }),
    process: molecule => {
      const output = {
        id: molecule.id,
        type: 'text',
        value: ''
      };

      each(molecule.atoms, ({ id, value }) => {
        if (id.includes('promptAtom')) {
          output.label = value;
        }

        if (id.includes('placeholderAtom')) {
          output.placeholder = value;
        }

        if (id.includes('characterLimitAtom')) {
          output.maxLength = value;
        }
      });

      return output;
    }
  },
  numberMolecule: {
    build: key => ({
      id: `numberMolecule|${key}`,
      label: 'Number',
      atoms: [
        {
          id: `promptAtom|${key}`,
          label: 'Prompt',
          type: 'text',
          placeholder: 'Enter Prompt',
          value: ''
        },
        {
          id: `minAtom|${key}`,
          label: 'Min',
          type: 'number',
          placeholder: 'Enter Min',
          value: String(0)
        },
        {
          id: `maxAtom|${key}`,
          label: 'Max',
          type: 'number',
          placeholder: 'Enter Max',
          value: String(100)
        }
      ]
    }),
    process: molecule => {
      const output = {
        id: molecule.id,
        type: 'number',
        value: null
      };

      each(molecule.atoms, ({ id, value }) => {
        if (id.includes('promptAtom')) {
          output.label = value;
        }

        if (id.includes('minAtom')) {
          output.min = value;
        }

        if (id.includes('maxAtom')) {
          output.max = value;
        }
      });

      return output;
    }
  },
  rangeMolecule: {
    build: key => ({
      id: `rangeMolecule|${key}`,
      label: 'Range',
      atoms: [
        {
          id: `promptAtom|${key}`,
          label: 'Prompt',
          type: 'text',
          placeholder: 'Enter Prompt',
          value: ''
        },
        {
          id: `minAtom|${key}`,
          label: 'Min',
          type: 'number',
          placeholder: 'Enter Min',
          value: String(1)
        },
        {
          id: `maxAtom|${key}`,
          label: 'Max',
          type: 'number',
          placeholder: 'Enter Max',
          value: String(5)
        }
      ]
    }),
    process: molecule => {
      const output = {
        id: molecule.id,
        type: 'range',
        value: ''
      };

      each(molecule.atoms, ({ id, value }) => {
        if (id.includes('promptAtom')) {
          output.label = value;
        }

        if (id.includes('minAtom')) {
          output.min = value;
        }

        if (id.includes('maxAtom')) {
          output.max = value;
        }
      });

      return output;
    }
  },
  dateMolecule: {
    build: key => ({
      id: `dateMolecule|${key}`,
      label: 'Date',
      atoms: [
        {
          id: `promptAtom|${key}`,
          label: 'Prompt',
          type: 'text',
          placeholder: 'Enter Prompt',
          value: ''
        }
      ]
    }),
    process: molecule => {
      const output = {
        id: molecule.id,
        type: 'date',
        value: formatDate(new Date())
      };

      each(molecule.atoms, ({ id, value }) => {
        if (id.includes('promptAtom')) {
          output.label = value;
        }
      });

      return output;
    }
  },
  yesnoMolecule: {
    build: key => ({
      id: `yesnoMolecule|${key}`,
      label: 'Yes-No',
      atoms: [
        {
          id: `promptAtom|${key}`,
          label: 'Prompt',
          type: 'text',
          placeholder: 'Enter Prompt',
          value: ''
        }
      ]
    }),
    process: molecule => {
      const output = {
        id: molecule.id,
        type: 'text',
        value: ''
      };

      each(molecule.atoms, ({ id, value }) => {
        if (id.includes('promptAtom')) {
          output.label = value;
        }
      });

      return output;
    }
  },
}

export const availableMolecules = keys(formMolecules);


export const processOrganism = organism => {
  const output = [];

  each(organism.molecules, molecule => {
    const moleculeId = parseId(molecule.id);

    output.push(formMolecules[moleculeId].process(molecule));
  });

  return output;
}

export const buildPayload = ({ organism, formFields }) => {
  if (organism && formFields) {
    return {
      id: organism.id,
      ...formFields.reduce((mapping, formField) => {
        mapping[formField.id] = formField.type === 'number'
          ? Number(formField.value)
          : formField.value === null ? '' : String(formField.value);

        return mapping;
      }, {})
    }
  }

  return {}
}
