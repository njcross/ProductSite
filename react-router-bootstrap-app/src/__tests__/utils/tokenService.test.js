import { setToken, getToken, removeToken } from '../../utils/tokenService';

describe('tokenService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves token', () => {
    setToken('abc123');
    expect(getToken()).toBe('abc123');
  });

  it('clears token', () => {
    setToken('abc123');
    removeToken();
    expect(getToken()).toBeNull();
  });
});