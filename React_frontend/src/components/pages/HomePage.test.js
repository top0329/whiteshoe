import axios from 'axios';

test('connectToBackend should connect to the backend node app', async () => {
  const mockResponse = { ok: true };
  jest.spyOn(axios, 'get').mockResolvedValue(mockResponse);

  await connectToBackend();

  expect(axios.get).toHaveBeenCalledWith('http://localhost:3000');
  expect(console.log).toHaveBeenCalledWith('Connected to backend node app');
});

test('connectToBackend should handle connection error', async () => {
  const mockError = new Error('Failed to connect');
  jest.spyOn(axios, 'get').mockRejectedValue(mockError);
  jest.spyOn(console, 'error').mockImplementation(() => {});

  await connectToBackend();

  expect(axios.get).toHaveBeenCalledWith('http://localhost:3000');
  expect(console.error).toHaveBeenCalledWith('Failed to connect to backend node app:', mockError);
});