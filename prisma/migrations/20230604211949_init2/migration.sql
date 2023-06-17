-- CreateTable
CREATE TABLE "_AuthorToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorToCategory_AB_unique" ON "_AuthorToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorToCategory_B_index" ON "_AuthorToCategory"("B");

-- AddForeignKey
ALTER TABLE "_AuthorToCategory" ADD CONSTRAINT "_AuthorToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToCategory" ADD CONSTRAINT "_AuthorToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
