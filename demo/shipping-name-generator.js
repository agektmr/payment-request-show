window.namegen = () => {
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  const adjectives = [
    'Super',
    'Mega',
    'Crazy',
    'Happy Times',
    'Meh',
    'The Worst',
    'Premium',
  ];

  const verbs = [
    'Slow',
    'Speedy',
    'Unreliable',
    'Route',
    'Swift',
    'Hasty',
    'Prompt',
  ];

  const randomAdj = adjectives[getRandomNumber(0, adjectives.length)];
  const randomVerb = verbs[getRandomNumber(0, verbs.length)];

  return `${randomAdj} ${randomVerb} Shipping`;
};
