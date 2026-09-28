import { render, screen } from '@testing-library/react';
import App from './App';

// Test que pasa
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/¡Universidad Católica de Pereira !/i);
  expect(linkElement).toBeInTheDocument();
});

// Test que falla
/* test('Test que falla', () => { 
  expect(true).toBe(false); 
}); */