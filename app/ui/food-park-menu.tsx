"use client";

import { useMemo, useState } from "react";
import { establishments } from "./menu-data";

type CartItem = { itemId: string; establishmentId: string; quantity: number };
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function FoodParkMenu({ tableNumber }: { tableNumber: number }) {
  const [selectedId, setSelectedId] = useState(establishments[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const selected = establishments.find((place) => place.id === selectedId)!;
  const detailedCart = useMemo(() => cart.map((row) => {
    const place = establishments.find((entry) => entry.id === row.establishmentId)!;
    const item = place.items.find((entry) => entry.id === row.itemId)!;
    return { ...row, place, item };
  }), [cart]);
  const total = detailedCart.reduce((sum, row) => sum + row.item.price * row.quantity, 0);
  const add = (itemId: string) => setCart((old) => {
    const found = old.find((row) => row.itemId === itemId && row.establishmentId === selected.id);
    return found ? old.map((row) => row === found ? { ...row, quantity: row.quantity + 1 } : row) : [...old, { itemId, establishmentId: selected.id, quantity: 1 }];
  });
  const remove = (itemId: string, establishmentId: string) => setCart((old) => old.flatMap((row) => row.itemId === itemId && row.establishmentId === establishmentId ? (row.quantity === 1 ? [] : [{ ...row, quantity: row.quantity - 1 }]) : [row]));
  const groups = establishments.map((place) => ({ place, rows: detailedCart.filter((row) => row.establishmentId === place.id) })).filter((group) => group.rows.length);
  const whatsappLink = (placeId: string) => {
    const group = groups.find((entry) => entry.place.id === placeId)!;
    const groupTotal = group.rows.reduce((sum, row) => sum + row.item.price * row.quantity, 0);
    const text = [
      `🍽️ NOVO PEDIDO — Mesa ${tableNumber}`,
      customerName.trim() ? `Cliente: ${customerName.trim()}` : "Cliente: não informado",
      "",
      ...group.rows.map((row) => `${row.quantity}x ${row.item.name} — ${money(row.item.price * row.quantity)}`),
      "",
      `Total: ${money(groupTotal)}`,
      "Pagamento diretamente com o estabelecimento.",
    ].join("\n");
    return `https://wa.me/${group.place.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };
  return <main>
    <header><span className="badge">MESA {tableNumber}</span><h1>Park Menu</h1><p>Escolha onde pedir. Cada estabelecimento recebe apenas seus próprios itens.</p></header>
    <nav aria-label="Estabelecimentos">{establishments.map((place) => <button key={place.id} className={place.id === selectedId ? "tab active" : "tab"} onClick={() => setSelectedId(place.id)}>{place.emoji} {place.name}</button>)}</nav>
    <section className="menu"><div className="place-heading"><span>{selected.emoji}</span><div><h2>{selected.name}</h2><p>{selected.type}</p></div></div>{selected.items.map((item) => <article className="product" key={item.id}><div><h3>{item.name}</h3><p>{item.description}</p><strong>{money(item.price)}</strong></div><button className="add" onClick={() => add(item.id)}>Adicionar</button></article>)}</section>
    {cart.length > 0 && <aside className="cart"><div><span>{cart.reduce((sum, row) => sum + row.quantity, 0)} itens</span><strong>{money(total)}</strong></div><button onClick={() => setShowCheckout(true)}>Ver pedido</button></aside>}
    {showCheckout && <div className="overlay" role="dialog" aria-modal="true"><section className="checkout"><button className="close" onClick={() => setShowCheckout(false)} aria-label="Fechar">×</button><h2>Seu pedido</h2><label>Seu nome <input placeholder="Opcional" value={customerName} onChange={(event) => setCustomerName(event.target.value)} /></label>{groups.map(({ place, rows }) => <div className="order-group" key={place.id}><h3>{place.emoji} {place.name}</h3>{rows.map((row) => <div className="order-row" key={row.itemId}><span>{row.item.name} × {row.quantity}</span><span><button onClick={() => remove(row.itemId, row.establishmentId)}>−</button> {money(row.item.price * row.quantity)}</span></div>)}<a href={whatsappLink(place.id)} target="_blank" rel="noreferrer">Enviar para {place.name} no WhatsApp</a></div>)}<p className="hint">Ao tocar em cada botão, você confirma o envio no seu WhatsApp.</p></section></div>}
  </main>;
}
