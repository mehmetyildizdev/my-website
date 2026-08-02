import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off', // Suppresses the useEffect setState errors
      'react-hooks/purity': 'warn', // Downgrades purity errors to warnings
      'react-hooks/refs': 'warn', // Downgrades ref mutation errors to warnings
      'react/no-unescaped-entities': 'off', // Turns off unescaped quotes errors
    },
  },
];

export default eslintConfig;
