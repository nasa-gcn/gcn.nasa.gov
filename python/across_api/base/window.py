from datetime import datetime

from .ephem import EphemBase
from .schema import VisWindow


class MakeWindowBase:
    ephem: EphemBase
    begin: datetime
    end: datetime

    def constraint(self, index):
        """
        Returns the constraint for the given index.

        Parameters:
            index (int): The index of the constraint.

        Returns:
            str: The constraint value.
        """
        # For this dummy method, we just assume SAA always, which is good for the SAA class.
        return "SAA"

    def make_windows(self, inconstraint: list, wintype=VisWindow) -> list:
        """
        Record SAA windows from array

        Parameters
        ----------
        inconstraint : list
            List of booleans indicating if the spacecraft is in the SAA
        wintype : VisWindow
            Type of window to create (default: VisWindow)

        Returns
        -------
        list
            List of SAAEntry objects
        """
        windows = []
        inocc = True
        istart = self.ephem.ephindex(self.begin)
        istop = self.ephem.ephindex(self.end) + 1
        for i in range(istart, istop):
            # print(f"{i=} {inconstraint[i]=} {inocc=} {self.constraint(i)=}")
            if inocc is True and not inconstraint[i]:
                inocc = False
                inindex = i
            if inocc is False and inconstraint[i]:
                inocc = True
                windows.append(
                    wintype(
                        begin=self.ephem.timestamp[inindex],
                        end=self.ephem.timestamp[i],
                        initial=self.constraint(inindex - 1),
                        final=self.constraint(i),
                    )
                )  # type: ignore

        if not inocc:
            win = wintype(begin=self.ephem.timestamp[inindex], end=self.ephem.timestamp[i], initial=self.constraint(inindex), final=self.constraint(i))  # type: ignore
            if (win.end - win.begin).total_seconds() > 0:
                windows.append(win)
        return windows
