// Un template se re-monta en cada navegacion, asi la animacion de entrada
// se reproduce al cambiar de pagina (a diferencia del layout, que persiste).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="anim-fade-up">{children}</div>;
}
