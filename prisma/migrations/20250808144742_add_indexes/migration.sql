-- CreateIndex
CREATE INDEX "Option_pollId_idx" ON "Option"("pollId");

-- CreateIndex
CREATE INDEX "Poll_startDate_idx" ON "Poll"("startDate");

-- CreateIndex
CREATE INDEX "Poll_endDate_idx" ON "Poll"("endDate");

-- CreateIndex
CREATE INDEX "UserBadge_userId_earnedAt_idx" ON "UserBadge"("userId", "earnedAt");

-- CreateIndex
CREATE INDEX "Vote_userId_timestamp_idx" ON "Vote"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "Vote_optionId_timestamp_idx" ON "Vote"("optionId", "timestamp");
