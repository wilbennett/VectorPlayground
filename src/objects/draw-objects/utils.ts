import { Value, VectorObject } from '..';
import { Vec } from '../../core';
import { Tristate } from '../../core/types';
import { Utils } from '../../utils';

const { checkType } = Utils;

export function getVectorObjectFromSource(source?: Value<Vec>) {
    let obj: Tristate<VectorObject>;
    let vec: Tristate<Vec>;

    if (source) {
        vec = source.value;
        // @ts-ignore - incompatible type.
        obj = checkType(VectorObject, source.owner);
    }

    return obj || new VectorObject("temp", vec || Vec.emptyDirection);
}