import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from '../context/UserContext';

describe('UserContext', () => {
  it('provides and updates user state', () => {
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.currentUser).toBeNull();

    act(() => {
      result.current.setCurrentUser({ username: 'testuser' });
    });

    expect(result.current.currentUser).toEqual({ username: 'testuser' });
  });
});