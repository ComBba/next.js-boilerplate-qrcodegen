import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import Home from '../pages/index'

test('generates a QR code', async () => {
  render(<Home />)
  fireEvent.change(screen.getByPlaceholderText(/Enter URL here/i), {
    target: { value: 'https://www.example.com' },
  })
  fireEvent.click(screen.getByText(/Generate/i))

  await waitFor(() => screen.getByAltText(/Generated QR Code/i))
  const qrCode = screen.getByAltText(/Generated QR Code/i)
  expect(qrCode).toHaveAttribute('src')
})
