export function createCartMock() {
  let cart = [];
  let callCount = 0;

  const fetch_mock = jest.fn((url, options = {}) => {
    callCount++;

    // Handle /api/check-login
    if (url.endsWith('/api/check-login')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, username: 'test' }),
      });
    }
    if (url.includes('/api/inventory/') && options.method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 101, kit_id: 42, quantity: 10, location: '0,0', location_name: 'Test Location' },
          ]),
      });
    }

    // GET cart
    if (url.endsWith('/api/cart') && (!options.method || options.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([...cart]),
      });
    }

    // POST add to cart
    if (url.endsWith('/api/cart') && options.method === 'POST') {
      const body = JSON.parse(options.body);
      const newItem = {
        id: cart.length + 1, // mock ID
        kit_id: body.kit_id || body.kit, // ensure kit_id is present
        quantity: body.quantity || 1,
        inventory_id: body.inventory_id || null,
      };
      cart.push(newItem);
      return Promise.resolve({
        ok: true,
        // 👇 CHANGE HERE
        json: () => Promise.resolve(newItem),  // Return the new item so frontend knows it was added
      });
    }

    // PUT update quantity
    const matchPut = url.match(/\/api\/cart\/(\d+)$/);
    if (matchPut && options.method === 'PUT') {
      const itemId = parseInt(matchPut[1], 10);
      const update = JSON.parse(options.body);
      cart = cart.map(item =>
        item.id === itemId ? { ...item, quantity: update.quantity } : item
      );
      return Promise.resolve({ ok: true });
    }

    // DELETE item
    const matchDelete = url.match(/\/api\/cart\/(\d+)$/);
    if (matchDelete && options.method === 'DELETE') {
      const itemId = parseInt(matchDelete[1], 10);
      cart = cart.filter(item => item.id !== itemId);
      return Promise.resolve({ ok: true });
    }

    // Fallback for unhandled URLs
    return Promise.reject(new Error(`Unhandled fetch call: ${url}`));
  });

  return {
    fetch_mock,
    fetchCallCount: () => callCount,
    resetCart: () => (cart = []),
    getCartState: () => [...cart],
  };
}
