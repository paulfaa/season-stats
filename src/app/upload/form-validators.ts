import { ValidatorFn, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";

export function totalPointsOrderValidator(): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    if (!(formArray instanceof FormArray)) return null;

    const groups = formArray.controls;

    for (let i = 0; i < groups.length; i++) {
      const currCtrl = groups[i].get('totalPoints');
      if (!currCtrl) continue;

      if (i === 0) {
        if (currCtrl.hasError('higherThanAbove')) {
          const { higherThanAbove, ...otherErrors } = currCtrl.errors || {};
          currCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
        continue;
      }

      const prevValues = groups
        .slice(0, i)
        .map(g => g.get('totalPoints')?.value)
        .filter(v => v != null) as number[];

      const maxPrev = prevValues.length > 0 ? Math.max(...prevValues) : null;

      if (maxPrev != null && currCtrl.value != null && currCtrl.value > maxPrev) {
        const errors = { ...(currCtrl.errors || {}), higherThanAbove: true };
        currCtrl.setErrors(errors);
      } else {
        if (currCtrl.hasError('higherThanAbove')) {
          const { higherThanAbove, ...otherErrors } = currCtrl.errors || {};
          currCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }
    }

    return null;
  };
}