// test/generateQR.test.js
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import Home from '../pages/index'

const server = setupServer(
  rest.post('/api/generate', (req, res, ctx) => {
    return res(ctx.json({ filename: 'test.png' }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('generates a QR code', async () => {
  render(<Home />)
  fireEvent.change(screen.getByPlaceholderText(/Enter URL here/i), {
    target: { value: 'https://www.example.com' },
  })
  fireEvent.click(screen.getByText(/Generate/i))

  await waitFor(() => screen.getByAltText(/Generated QR Code/i), { timeout: 3000 }) // waits up to 3 seconds
  const qrCode = screen.getByAltText(/Generated QR Code/i)
  expect(qrCode).toHaveAttribute('src', '/images/test.png')
})
