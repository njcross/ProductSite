export function createCartMock() {
    let mockCart = [];
    let fetchCalls = 0;
  
    const fetchMock = jest.fn((url, options = {}) => {
      fetchCalls++;
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body) : null;
  
      if (url.endsWith('/api/cart') && method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([...mockCart]),
        });
      }
  
      if (url.endsWith('/api/cart') && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        mockCart.push({ id: 1, kit_id: body.kit_id, quantity: body.quantity });
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
  
      if (url.includes('/api/cart/') && method === 'PUT') {
        const id = parseInt(url.split('/').pop());
        mockCart = mockCart.map((item) =>
          item.id === id ? { ...item, quantity: body.quantity } : item
        );
        return Promise.resolve({ ok: true });
      }
  
      if (url.includes('/api/cart/') && method === 'DELETE') {
        const id = parseInt(url.split('/').pop());
        mockCart = mockCart.filter((item) => item.id !== id);
        return Promise.resolve({ ok: true });
      }
  
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  
    return { fetch_mock: fetchMock, mock_cart_state: mockCart, fetchCallCount: () => fetchCalls };
  }
  