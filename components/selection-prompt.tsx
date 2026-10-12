import type {Lang} from '@/lib/content';
import {ui} from '@/lib/i18n';
export const selectionCopy={en:{hint:'Select a part to see how it works. Click the background to clear your selection.',clear:'Clear selection'},fr:{hint:'Sélectionnez une pièce pour découvrir son fonctionnement. Cliquez sur le fond pour désélectionner.',clear:'Effacer la sélection'},pt:{hint:'Selecione uma peça para ver como funciona. Clique no fundo para limpar a seleção.',clear:'Limpar seleção'},ar:{hint:'اختر جزءاً لتعرف كيف يعمل. اضغط على الخلفية لإلغاء التحديد.',clear:'إلغاء التحديد'}};
export function SelectionPrompt({lang}:{lang:Lang}){return <div className="selection-prompt" role="status"><h3>{ui[lang].choosePart}</h3><p>{selectionCopy[lang].hint}</p></div>}
