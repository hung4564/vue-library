import { createContext, ReactNode, useContext } from 'react';

const ContainerContext = createContext<string | undefined>(undefined);

export function ContainerProvider({
  containerId,
  children,
}: {
  containerId: string;
  children: ReactNode;
}) {
  return (
    <ContainerContext.Provider value={containerId}>
      {children}
    </ContainerContext.Provider>
  );
}

export function useContainerId(containerId?: string): string {
  const contextId = useContext(ContainerContext);
  const id = containerId || contextId;
  if (!id) {
    throw new Error('Not set container id');
  }
  return id;
}
